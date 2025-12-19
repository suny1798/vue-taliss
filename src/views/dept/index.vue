<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, onMounted } from 'vue';
import { getDeptListApi, addDeptApi, findDeptByIdApi, updateDeptApi, deleteDeptApi } from '@/api/dept';

onMounted(() => {
    search();
});

const search = async () => {
    const res =  await getDeptListApi();
    if (res.code == 1){
      deptList.value = res.data;
    }

};

const deptFormRef = ref();
const formTitle = ref('');
const deptList = ref([]);
const dept = ref({name: ''});

const addDept = () => {
  formTitle.value = '新增部门';
  dialogFormVisible.value = true;
  dept.value = {};
  deptFormRef.value.resetFields();
};
const save = async  () => {
  if (!deptFormRef.value) return;
  await deptFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请填写正确的部门信息');
    }else{

      let result;
      if (dept.value.id){
        // 编辑操作
        result = await updateDeptApi(dept.value);
      }else{
        // 新增操作
        result = await addDeptApi(dept.value);
      }

      if (result.code == 1){
        ElMessage.success('操作成功');
        dialogFormVisible.value = false;
        search();
      }
      else{
        ElMessage.error(result.msg);
      }
    }
  });


};

const  dialogFormVisible = ref(false);

const rules = ref({
  name: [
    { required: true, message: '部门是必填选项', trigger: 'blur' },
    { min: 2, max: 10, message: '部门名称长度在2-10位', trigger: 'blur' },
  ]
});

const edit = async (id) => { 
  const result = await findDeptByIdApi(id);
  if (result.code == 1){
    dept.value = result.data;
    formTitle.value = '编辑部门';
    dialogFormVisible.value = true;
  }  
  deptFormRef.value.resetFields();
};

const delById = async(id) => { 
  ElMessageBox.confirm(
    '确定要删除该部门吗?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const result = await  deleteDeptApi(id);
      if (result.code == 1){
        search();
        ElMessage({
          type: 'success',
          message: '删除成功',
        })
      }
      else{
        ElMessage({
          type: 'error',
          message: result.msg,
        })
      }

    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
};

</script>

<template>
  <h1>部门管理</h1>
  <div class="btns">
      <el-button type="success" @click=addDept() >+ 新增部门</el-button>
  </div>
  <div class="table"> 
    <el-table :data="deptList" stripe style="width: 100%">
      <el-table-column type="index" label="序号" width="150" align="center" />
      <el-table-column prop="name" label="部门名称" width="300"  align="center" />
      <el-table-column prop="updateTime" label="最后操作时间"  width="500"  align="center" />
      <el-table-column label="操作"  align="center" >
        <template #default = "scope">
          <el-button type="primary" size="small" @click="edit(scope.row.id)"><el-icon><Edit /></el-icon>&nbsp;编辑</el-button>
          <el-button type="danger" size="small" @click="delById(scope.row.id)"><el-icon><Delete /></el-icon>&nbsp;删除</el-button>
        </template> 
      </el-table-column>
  </el-table>
  </div>


  <el-dialog v-model="dialogFormVisible" :title="formTitle" width="500">
    <el-form :model="dept" :rules="rules" ref="deptFormRef">
      <el-form-item label="部门名称" :label-width="formLabelWidth" prop="name" >
        <el-input v-model="dept.name" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="save">确认</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<style scoped>

.btns {
  margin: 20px 50px;
  float: right;
}
.table {
  margin: 10px 10px;
}
</style>
