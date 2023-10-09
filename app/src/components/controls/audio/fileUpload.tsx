import { Input } from "@/components/ui/input";

export const FileUploadControls = ({}) => {
  return (
    <Input
      id="fileUpload"
      type="file"
      accept="audio/*"
      className="w-64 text-foreground"
    />
  );
};
