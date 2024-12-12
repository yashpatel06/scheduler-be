"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postActionsForReq = exports.postActions = exports.getActionsDetails = exports.preActions = exports.statusUpdate = exports.getRequests = exports.createRequest = void 0;
const requestModel_1 = __importDefault(require("../models/requestModel"));
const responseWrapper_1 = __importDefault(require("../helper/responseWrapper"));
const userModel_1 = __importDefault(require("../models/userModel"));
const actoinsModel_1 = __importDefault(require("../models/actoinsModel"));
const mongoose_1 = require("mongoose");
const createRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = (_a = req === null || req === void 0 ? void 0 : req.token) === null || _a === void 0 ? void 0 : _a.user;
        if ((user === null || user === void 0 ? void 0 : user.role) !== "Sales") {
            const response = (0, responseWrapper_1.default)(true, "Unauthorized: You are not allowed to create request", 404);
            return res.status(404).json(response);
        }
        // const startDate = moment(req.body.startDate, "DD-MM-YYYY", true);
        // const endDate = moment(req.body.endDate, "DD-MM-YYYY", true);
        // if (!startDate.isValid() || !endDate.isValid()) {
        //   return res.status(400).json({ error: "Invalid date format" });
        // }
        const request = new requestModel_1.default(req.body
        // startDate: startDate.toDate(),
        // endDate: endDate.toDate(),
        );
        request.createdBy = user === null || user === void 0 ? void 0 : user._id;
        yield request.save();
        const response = (0, responseWrapper_1.default)(true, "success", 200, request);
        return res.json(response);
    }
    catch (error) {
        return res.status(500).json({ error: error === null || error === void 0 ? void 0 : error.message });
    }
});
exports.createRequest = createRequest;
const getRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const user = (_a = req === null || req === void 0 ? void 0 : req.token) === null || _a === void 0 ? void 0 : _a.user;
        const role = user === null || user === void 0 ? void 0 : user.role;
        const { startDate, endDate, status, userId } = req.body;
        let sales = (user === null || user === void 0 ? void 0 : user.role) === "Sales" ? [user] : [];
        if (role === "VP") {
            const head = yield userModel_1.default.find({ reportsTo: user === null || user === void 0 ? void 0 : user._id, isDeleted: false }, { _id: 1, role: 1 });
            if (head.some((x) => x.role === "Sales")) {
                for (const h of head) {
                    if (h.role === "Sales")
                        sales.push(h);
                }
            }
            const managers = yield userModel_1.default.find({ reportsTo: { $in: head.map((x) => x._id) }, isDeleted: false }, { _id: 1, role: 1 });
            for (const h of managers) {
                if (h.role === "Sales")
                    sales.push(h);
            }
            const s = yield userModel_1.default.find({
                reportsTo: { $in: managers.map((x) => x._id) },
                isDeleted: false,
            });
            sales.push(...s);
        }
        if (role === "Head") {
            const managers = yield userModel_1.default.find({ reportsTo: user === null || user === void 0 ? void 0 : user._id, isDeleted: false }, { _id: 1, role: 1 });
            for (const h of managers) {
                if (h.role === "Sales")
                    sales.push(h);
            }
            const s = yield userModel_1.default.find({
                reportsTo: { $in: managers.map((x) => x._id) },
                isDeleted: false,
            });
            sales.push(...s);
        }
        if (role === "Manager") {
            const s = yield userModel_1.default.find({
                reportsTo: user === null || user === void 0 ? void 0 : user._id,
                isDeleted: false,
            });
            sales.push(...s);
        }
        const filters = {
            createdBy: { $in: sales.map((x) => x._id) },
            isDeleted: false,
        };
        if (startDate && endDate) {
            filters.startDate = { $gte: startDate };
            filters.endDate = { $lte: endDate };
        }
        if (status)
            filters.status = status;
        if (userId)
            filters.createdBy = userId;
        const requests = yield requestModel_1.default.find(filters).populate("createdBy", "name role");
        const records = yield requestModel_1.default.aggregate([
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
            record.totalActions = (_b = record === null || record === void 0 ? void 0 : record.actions) === null || _b === void 0 ? void 0 : _b.reduce((sum, item) => sum + item.action.length, 0);
            record.doneCount =
                (_c = record.actions.reduce((count, item) => {
                    var _a;
                    const filledRemarks = (_a = item === null || item === void 0 ? void 0 : item.action) === null || _a === void 0 ? void 0 : _a.filter((a) => { var _a; return (a === null || a === void 0 ? void 0 : a.remark) && ((_a = a === null || a === void 0 ? void 0 : a.remark) === null || _a === void 0 ? void 0 : _a.trim()) !== ""; }).length;
                    return count + filledRemarks;
                }, 0)) !== null && _c !== void 0 ? _c : 0;
            record.pendingCount =
                (_e = (_d = record === null || record === void 0 ? void 0 : record.actions) === null || _d === void 0 ? void 0 : _d.reduce((count, item) => {
                    const p = item === null || item === void 0 ? void 0 : item.action.filter((a) => (a === null || a === void 0 ? void 0 : a.remark) === "" || !(a === null || a === void 0 ? void 0 : a.remark)).length;
                    return count + p;
                }, 0)) !== null && _e !== void 0 ? _e : 0;
        }
        return res.json((0, responseWrapper_1.default)(true, "success", 200, records));
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch requests" });
    }
});
exports.getRequests = getRequests;
const statusUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = (_a = req === null || req === void 0 ? void 0 : req.token) === null || _a === void 0 ? void 0 : _a.user;
        const { requestId, status } = req.body;
        if (!["Pending", "Approved", "Rejected"].includes(status)) {
            return res.json((0, responseWrapper_1.default)(false, "Invalid status value", 400));
        }
        const requestData = yield requestModel_1.default.findById(requestId);
        const userData = yield userModel_1.default.findById(requestData === null || requestData === void 0 ? void 0 : requestData.createdBy);
        if (!requestData) {
            return res.json((0, responseWrapper_1.default)(false, "Request data not found", 404));
        }
        if (requestData.status !== "Pending") {
            return res.json((0, responseWrapper_1.default)(false, `you cannot change the status of ${requestData.status}`, 400));
        }
        if (!userData) {
            return res.json((0, responseWrapper_1.default)(false, "Data not found", 404));
        }
        const isAuthorized = userData.reportsTo === (user === null || user === void 0 ? void 0 : user._id);
        if (!isAuthorized && user.role !== "VP") {
            return res.json((0, responseWrapper_1.default)(false, "Unauthorized: You are not allowed to update this status", 403));
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
        yield requestData.save();
        return res.json((0, responseWrapper_1.default)(true, "success", 200, requestData));
    }
    catch (error) {
        // Handle errors
        return res.json((0, responseWrapper_1.default)(false, error.message || "Internal server error", 500));
    }
});
exports.statusUpdate = statusUpdate;
const preActions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = (_a = req === null || req === void 0 ? void 0 : req.token) === null || _a === void 0 ? void 0 : _a.user;
        const { requestId, visitDate, placeVisit, visitType, purpose, remarks, status, statusHistory, action, } = req.body;
        const newAction = new actoinsModel_1.default({
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
        const requestData = yield requestModel_1.default.findById(requestId);
        if (!requestData) {
            const response = (0, responseWrapper_1.default)(false, `data not found`, 400);
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
            const response = (0, responseWrapper_1.default)(false, `Unauthorized`, 400);
            return res.json(response);
        }
        const savedAction = yield newAction.save();
        const response = (0, responseWrapper_1.default)(true, "success", 200, savedAction);
        return res.json(response);
    }
    catch (error) {
        // console.error("Error saving action:", error);
        return res.json((0, responseWrapper_1.default)(false, "Failed to create pre action", 500));
    }
});
exports.preActions = preActions;
const getActionsDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId } = req.body;
        // const data = await Action.find({
        //   requestId: new Types.ObjectId(requestId),
        // });
        const data = yield requestModel_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.Types.ObjectId(requestId),
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
            const response = (0, responseWrapper_1.default)(false, "Data not found", 400);
            return res.json(response);
        }
        const response = (0, responseWrapper_1.default)(true, "success", 200, data);
        return res.json(response);
    }
    catch (error) {
        console.error("Error saving action:", error);
        return res.json((0, responseWrapper_1.default)(false, error.message, 500));
    }
});
exports.getActionsDetails = getActionsDetails;
const postActions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { action, mainActionId } = req.body;
        const result = yield actoinsModel_1.default.updateOne({ _id: mainActionId, "action._id": new mongoose_1.Types.ObjectId(action._id) }, {
            $set: {
                "action.$.remark": action === null || action === void 0 ? void 0 : action.remark,
                "action.$.nextPlan": action === null || action === void 0 ? void 0 : action.nextPlan,
            },
        }, { new: true });
        const response = (0, responseWrapper_1.default)(true, "Success", 200, result);
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("Error updating remarks:", error);
        return res.status(500).json({
            error: error.message,
        });
    }
});
exports.postActions = postActions;
const postActionsForReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mainActionId, requestRemark } = req.body;
        const result = yield actoinsModel_1.default.updateOne({ _id: mainActionId }, {
            $set: {
                requestRemark: requestRemark,
            },
        }, { new: true });
        const response = (0, responseWrapper_1.default)(true, "Success", 200, result);
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("Error updating remarks:", error);
        return res.status(500).json({
            error: error.message,
        });
    }
});
exports.postActionsForReq = postActionsForReq;
