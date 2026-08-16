export type Post = {
  slug?: string
  title?: string
  author?: string
  date?: Date
  content?: string
  excerpt?: string
  tags?: []
  [key: string]: any
}
