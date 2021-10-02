import { userData } from "./UserData"

export const getUsers = () => new Promise((resolve) => {
    setTimeout(() => resolve(userData), 1000)
})