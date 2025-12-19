import request from "@/utils/request";

export const getDeptListApi = () => {
    return request.get("/depts");
}

export const addDeptApi = (dept) => {
    return request.post("/depts", dept);
}

export const findDeptByIdApi = (id) => {
    return request.get(`/depts/${id}`);
}

export const updateDeptApi = (dept) => {
    return request.put("/depts", dept);
}

export const deleteDeptApi = (id) => {
    return request.delete(`/depts?id=${id}`);
}