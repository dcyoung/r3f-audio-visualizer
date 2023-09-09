import { type AudioFileInput } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitize = (v: any): File | undefined => {
  if (v === undefined) return undefined
  if (v instanceof File) {
    try {
      return v;
      // return URL.createObjectURL(v)
    } catch (e) {
      return undefined
    }
  }
  throw Error(`Invalid file format [undefined | blob | File].`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const schema = (_o: any, s: any) => s instanceof File || typeof s === "string";

export const normalize = ({ file }: AudioFileInput) => {
  return { value: file }
}