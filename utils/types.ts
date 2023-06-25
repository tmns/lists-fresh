export interface State {
  session: string | undefined
}

export interface User {
  id: string
  name?: string
  email?: string
  image?: string
}

export interface OauthSession {
  state: string
  codeVerifier: string
}

export interface List {
  id: string
  name: string
  userId: string
  createdAt: string
}

export interface Item {
  id: string
  title: string
  listId: string
  isChecked: boolean
  createdAt: string
}
