import type { LevaInputProps } from 'leva/plugin'
export type AudioFileInputProps = LevaInputProps<File | undefined>
export interface AudioFileInput { file: undefined | File }