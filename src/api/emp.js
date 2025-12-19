import request from "@/utils/request";

export const getEmpPageApi = (name, gender, begin, end, page, pagesize) => {
    return request.get(`/emps?name=${name}&gender=${gender}&begin=${begin}&end=${end}&page=${page}&pageSize=${pagesize}`);
}


export const addEmpApi = (emp) => {
    return request.post("/emps", emp);
}

export const findEmpByIdApi = (id) => {
    return request.get(`/emps/${id}`);
}

export const updateEmpApi = (emp) => {
    return request.put("/emps", emp);
}

export const deleteEmpByIdApi = (id) => {
    return request.delete(`/emps?ids=${id}`);
}