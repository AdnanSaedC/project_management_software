//we created this file beacuse we eant to maintain some thing
//in some format

export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member",
};

//its notthing but it exports an object which other files
//can import and use

export const AvailableUserRoles = Object.values(UserRolesEnum);

/**it returns an array in the name of avaialbleuserrole */

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done",
};

export const AvailableTaskStatus = Object.values(TaskStatusEnum);
