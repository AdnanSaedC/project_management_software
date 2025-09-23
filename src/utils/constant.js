//enum means enumeration
//it is nothing but creating a set of unique constant values

export const userRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member",
}

export const AvailableUserRoles = Object.values(userRolesEnum);

export const taskStatusEnum = {
    TODO : "todo",
    IN_PROGRESS : "in_progress",
    DONE: "done"
}

export const AvailableTaskStatus = Object.values(taskStatusEnum)

