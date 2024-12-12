export default function responseWrapper(
  success: boolean,
  message: string,
  status?: number,
  data?: any,
  error?: any
) {
  return {
    success,
    message,
    status: status ?? 500,
    data: data ?? null,
    error: error ?? null,
  };
}
