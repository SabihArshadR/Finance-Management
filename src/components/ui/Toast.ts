import { toast } from "react-hot-toast";

const SuccessToast = (message: string) => {
  toast.success(message);
};

const ErrorToast = (message: string) => {
  toast.error(message);
};

const InfoToast = (message: string) => {
  toast(message);
};

export { SuccessToast, ErrorToast, InfoToast };