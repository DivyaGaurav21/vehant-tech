import axios from "axios";
export function getRequestErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    return error.response?.data.error?.message ?? error.message;
  }
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred";
}
