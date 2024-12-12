import { Request, Response } from "express";
import RequestModel, { IRequest } from "../models/requestModel";
import responseWrapper from "../helper/responseWrapper";
import moment from "moment";
import User, { IUser } from "../models/userModel";
import Action from "../models/actoinsModel";
import { request } from "http";
import { CustomRequest } from "../middlewares/authMiddleware";
import { FilterQuery, Types } from "mongoose";

export const createRequest = async (req: CustomRequest, res: Response) => {
  try {
    const user = req?.token?.user;
    if (user?.role !== "Sales") {
      const response = responseWrapper(
        true,
        "Unauthorized: You are not allowed to create request",
        404
      );
      return res.status(404).json(response);
    }

    // const startDate = moment(req.body.startDate, "DD-MM-YYYY", true);
    // const endDate = moment(req.body.endDate, "DD-MM-YYYY", true);

    // if (!startDate.isValid() || !endDate.isValid()) {
    //   return res.status(400).json({ error: "Invalid date format" });
    // }

    const request = new RequestModel(
      req.body
      // startDate: startDate.toDate(),
      // endDate: endDate.toDate(),
    );

    request.createdBy = user?._id;

    await request.save();
    const response = responseWrapper(true, "success", 200, request);
    return res.json(response);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message });
  }
};

export const getRequests = async (req: CustomRequest, res: Response) => {
  try {
    const user = req?.token?.user;
    const role = user?.role;
    const { startDate, endDate, status, userId } = req.body;
    let sales: IUser[] = user?.role === "Sales" ? [user] : [];
    if (role === "VP") {
      const head = await User.find(
        { reportsTo: user?._id, isDeleted: false },
        { _id: 1, role: 1 }
      );
      if (head.some((x) => x.role === "Sales")) {
        for (const h of head) {
          if (h.role === "Sales") sales.push(h);
        }
      }
      const managers = await User.find(
        { reportsTo: { $in: head.map((x) => x._id) }, isDeleted: false },
        { _id: 1, role: 1 }
      );
      for (const h of managers) {
        if (h.role === "Sales") sales.push(h);
      }
      const s = await User.find({
        reportsTo: { $in: managers.map((x) => x._id) },
        isDeleted: false,
      });
      sales.push(...s);
    }
    if (role === "Head") {
      const managers = await User.find(
        { reportsTo: user?._id, isDeleted: false },
        { _id: 1, role: 1 }
      );
      for (const h of managers) {
        if (h.role === "Sales") sales.push(h);
      }

      const s = await User.find({
        reportsTo: { $in: managers.map((x) => x._id) },
        isDeleted: false,
      });
      sales.push(...s);
    }
    if (role === "Manager") {
      const s = await User.find({
        reportsTo: user?._id,
        isDeleted: false,
      });
      sales.push(...s);
    }
    const filters: FilterQuery<IRequest> = {
      createdBy: { $in: sales.map((x) => x._id) },
      isDeleted: false,
    };

    if (startDate && endDate) {
      filters.startDate = { $gte: startDate };
      filters.endDate = { $lte: endDate };
    }
    if (status) filters.status = status;
    if (userId) filters.createdBy = userId;

    const requests = await RequestModel.find(filters).populate(
      "createdBy",
      "name role"
    );
    const records = await RequestModel.aggregate([
      {
        $match: filters,
      },
      {
        $lookup: {
          from: "user",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "action",
          localField: "_id",
          foreignField: "requestId",
          as: "actions",
        },
      },
    ]);
    for (const record of records) {
      record.totalActions = record?.actions?.reduce(
        (sum, item) => sum + item.action.length,
        0
      );
      record.doneCount =
        record.actions.reduce((count, item) => {
          const filledRemarks = item?.action?.filter(
            (a) => a?.remark && a?.remark?.trim() !== ""
          ).length;
          return count + filledRemarks;
        }, 0) ?? 0;
      record.pendingCount =
        record?.actions?.reduce((count, item) => {
          const p = item?.action.filter(
            (a) => a?.remark === "" || !a?.remark
          ).length;
          return count + p;
        }, 0) ?? 0;
    }
    return res.json(responseWrapper(true, "success", 200, records));
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
};

export const statusUpdate = async (req: any, res: Response) => {
  try {
    const user = req?.token?.user;
    const { requestId, status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.json(responseWrapper(false, "Invalid status value", 400));
    }

    const requestData = await RequestModel.findById(requestId);

    const userData = await User.findById(requestData?.createdBy);

    if (!requestData) {
      return res.json(responseWrapper(false, "Request data not found", 404));
    }
    if (requestData.status !== "Pending") {
      return res.json(
        responseWrapper(
          false,
          `you cannot change the status of ${requestData.status}`,
          400
        )
      );
    }
    if (!userData) {
      return res.json(responseWrapper(false, "Data not found", 404));
    }

    const isAuthorized = userData.reportsTo === user?._id;

    if (!isAuthorized && user.role !== "VP") {
      return res.json(
        responseWrapper(
          false,
          "Unauthorized: You are not allowed to update this status",
          403
        )
      );
    }

    const oldStatus = requestData.status;
    requestData.status = status;

    requestData.statusHistory.push({
      statusFrom: oldStatus,
      statusTo: status,
      updatedAt: new Date(),
      updatedBy: user._id,
      remark: `Status updated to ${status}`,
    });

    await requestData.save();

    return res.json(responseWrapper(true, "success", 200, requestData));
  } catch (error: any) {
    // Handle errors
    return res.json(
      responseWrapper(false, error.message || "Internal server error", 500)
    );
  }
};

export const preActions = async (req: any, res: Response) => {
  try {
    const user = req?.token?.user;
    const {
      requestId,
      visitDate,
      placeVisit,
      visitType,
      purpose,
      remarks,
      status,
      statusHistory,
      action,
    } = req.body;

    const newAction = new Action({
      requestId,
      requestRemark: "",
      visitDate,
      placeVisit,
      visitType,
      purpose,
      remarks,
      status,
      statusHistory,
      action,
    });
    const requestData = await RequestModel.findById(requestId);
    if (!requestData) {
      const response = responseWrapper(false, `data not found`, 400);

      return res.json(response);
    }
    // if (requestData?.status !== "Approved") {
    //   const response = responseWrapper(
    //     false,
    //     `status is ${requestData?.status}`,
    //     400
    //   );
    //   res.status(400).json(response);
    // }

    if (user.role !== "Sales") {
      const response = responseWrapper(false, `Unauthorized`, 400);
      return res.json(response);
    }

    const savedAction = await newAction.save();
    const response = responseWrapper(true, "success", 200, savedAction);

    return res.json(response);
  } catch (error: any) {
    // console.error("Error saving action:", error);
    return res.json(responseWrapper(false, "Failed to create pre action", 500));
  }
};

export const getActionsDetails = async (req: any, res: Response) => {
  try {
    const { requestId } = req.body;

    // const data = await Action.find({
    //   requestId: new Types.ObjectId(requestId),
    // });
    const data = await RequestModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(requestId),
        },
      },
      {
        $lookup: {
          from: "action",
          foreignField: "requestId",
          localField: "_id",
          as: "action",
        },
      },
      {
        $unwind: {
          path: "$result",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (!data) {
      const response = responseWrapper(false, "Data not found", 400);
      return res.json(response);
    }

    const response = responseWrapper(true, "success", 200, data);
    return res.json(response);
  } catch (error: any) {
    console.error("Error saving action:", error);
    return res.json(responseWrapper(false, error.message, 500));
  }
};

export const postActions = async (req: any, res: Response) => {
  try {
    const { action, mainActionId } = req.body;

    const result = await Action.updateOne(
      { _id: mainActionId, "action._id": new Types.ObjectId(action._id) },
      {
        $set: {
          "action.$.remark": action?.remark,
          "action.$.nextPlan": action?.nextPlan,
        },
      },
      { new: true }
    );
    const response = responseWrapper(true, "Success", 200, result);
    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error updating remarks:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const postActionsForReq = async (req: any, res: Response) => {
  try {
    const { mainActionId, requestRemark } = req.body;

    const result = await Action.updateOne(
      { _id: mainActionId },
      {
        $set: {
          requestRemark: requestRemark,
        },
      },
      { new: true }
    );
    const response = responseWrapper(true, "Success", 200, result);
    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error updating remarks:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
};
