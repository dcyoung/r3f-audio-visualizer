import { useCallback } from "react";
import { useInputContext, Components } from "leva/plugin";
import type { AudioFileInputProps } from "./types";
import { useDropzone } from "react-dropzone";
const { Row, Label } = Components;
import {
  DropZone,
  FileInputContainer,
  FilePreview,
  Instructions,
  Remove,
} from "./styled";

export function AudioFileInputComponent() {
  const { label, value, onUpdate, disabled } =
    useInputContext<AudioFileInputProps>();
  const onDrop = useCallback(
    (acceptedFiles: string | any[]) => {
      if (acceptedFiles.length) onUpdate(acceptedFiles[0]);
    },
    [onUpdate]
  );

  const clear = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onUpdate(undefined);
    },
    [onUpdate]
  );

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    maxFiles: 1,
    accept: "audio/*",
    onDrop,
    disabled,
  });

  // TODO fix any in DropZone
  return (
    <Row input>
      <Label>{label}</Label>
      <FileInputContainer>
        {!!value ? (
          <>
            <FilePreview>
              <Remove onClick={clear} disabled={!value}>
                {`⏹${(value as File).name}`}
              </Remove>
            </FilePreview>
          </>
        ) : (
          <DropZone {...(getRootProps({ isDragAccept }) as any)}>
            <input {...getInputProps()} />
            <Instructions>{"Click to Upload"}</Instructions>
          </DropZone>
        )}
      </FileInputContainer>
    </Row>
  );
}
