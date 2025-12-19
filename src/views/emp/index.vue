<script setup>
import { ref, watch, onMounted } from 'vue';
import {getEmpPageApi, addEmpApi, findEmpByIdApi, updateEmpApi, deleteEmpByIdApi} from '@/api/emp';
import { getDeptListApi } from '@/api/dept';
import { ElMessage, ElMessageBox } from 'element-plus';

const searchEmp = ref({ name: '', gender: '', data: [], begin: '', end: ''})
//职位列表数据
const jobs = ref([{ name: '班主任', value: 1 },{ name: '讲师', value: 2 },{ name: '学工主管', value: 3 },{ name: '教研主管', value: 4 },{ name: '咨询师', value: 5 },{ name: '其他', value: 6 }])
//性别列表数据
const genders = ref([{ name: '男', value: 1 }, { name: '女', value: 2 }])
//部门列表数据
const depts = ref([])

//token
const token = ref('');

const addEmp = async () => { 
  employee.value = {username: '', name: '', gender: '', phone: '', job: '', salary: '', deptId: '', entryDate: '', image: '', exprList: []};
  dialogVisible.value = true;
  dialogTitle.value = '新增员工';
}

//查询所有部门信息
const queryDeptList = async () => { 
  const res = await getDeptListApi();
  if (res.code == 1){
    depts.value = res.data;
  }
}

const addexpr = () => { 
  employee.value.exprList.push(
    {
      company: '',
      job: '',
      begin: '',
      end: '',
      exprDate: []
    }
  )
}

//删除工作经历
const delExpr = (index) => { 
  employee.value.exprList.splice(index, 1)
}

//新增/修改表单
const employee = ref({
  username: '',
  name: '',
  gender: '',
  phone: '',
  job: '',
  salary: '',
  deptId: '',
  entryDate: '',
  image: '',
  exprList: []
})

// 控制弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')

//文件上传
// 图片上传成功后触发
const handleAvatarSuccess = (response) => {
  employee.value.image = response.data;
}
// 文件上传之前触发
const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('只支持上传图片')
    return false
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('只能上传10M以内图片')
    return false
  }
  return true
}

//分页查询员工信息
const search = async() => {
  const res = await getEmpPageApi(
    searchEmp.value.name, 
    searchEmp.value.gender, 
    searchEmp.value.begin, 
    searchEmp.value.end, 
    currentPage.value, 
    pageSize.value)
  if (res.code == 1){
    empList.value = res.data.rows;
    total.value = res.data.total;
  }
}

onMounted(() => {
  search();
  queryDeptList();
  getToken();
});

//获取token
const getToken =  () => { 
  const tokens = localStorage.getItem('token')
  if (tokens){
    token.value = tokens;
  }
}

//清空
const clear = () => {
  searchEmp.value = { name: '', gender: '', data: [], begin: '', end: ''};
  search();
}

// 监听时间范围
watch(() => searchEmp.value.data, (newVal) => {
  if (newVal.length == 2){
    searchEmp.value.begin = newVal[0];
    searchEmp.value.end = newVal[1];
  }else{
    searchEmp.value.begin = '';
    searchEmp.value.end = '';
  }
}),{ deep: true};

// 监听工作经历时间范围
watch(() => employee.value.exprList, (newVal) => {
  // 遍历工作经历列表，确保每个项目的时间范围正确设置
  newVal.forEach(item => {
    if (item.exprDate && item.exprDate.length === 2) {
      item.begin = item.exprDate[0];
      item.end = item.exprDate[1];
    } else {
      item.begin = '';
      item.end = '';
    }
  });
}, { deep: true });

const empList = ref([]);

const currentPage = ref(1)
const pageSize = ref(10)
const background = ref(true)
const total = ref(0)

const handleSizeChange = (val) => {
  search()
}
const handleCurrentChange = (val) => {
  search()
}

//取消回显
const cancle = () => {
  dialogVisible.value = false;
  employee.value = {username: '', name: '', gender: '', phone: '', job: '', salary: '', deptId: '', entryDate: '', image: '', exprList: []}
}

// 保存员工
const save = async () => { 

  let res;
  if(employee.value.id){
    // 编辑操作
    res = await updateEmpApi(employee.value);
  }else{
    // 新增操作
    res = await addEmpApi(employee.value);
  }
  if (res.code == 1){
    ElMessage.success('操作成功');
    dialogVisible.value = false;
    search();
  }
  else{
    ElMessage.error(res.msg);
  }
}


// 编辑员工
const edit = async (id) => { 
  const result = await findEmpByIdApi(id);
  if (result.code == 1){
    employee.value = result.data;
    dialogTitle.value = '编辑信息';
    dialogVisible.value = true;
    let exprList =  employee.value.exprList;
    for (let i = 0; i < exprList.length; i++) {
      exprList[i].exprDate = [exprList[i].begin, exprList[i].end];
    }
  }
};

// 删除员工
const delById = async(id) => { 
  ElMessageBox.confirm(
    '确定要删除该员工吗?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const result = await  deleteEmpByIdApi(id);
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

// 批量删除员工
const delEmps = async () => { 
  ElMessageBox.confirm(
    '确定要删除该员工吗?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      if (!selectedEmps.value.length){
        ElMessage.error('请选择要删除的记录');
        return;
      }
      const result = await  deleteEmpByIdApi(selectedEmps.value);
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

//记录选中的员工
const selectedEmps = ref([]);


const handleSelectionChange = (val) => {
  selectedEmps.value = [];
  val.forEach(item => {
    selectedEmps.value.push(item.id);
  });
};

</script>

<template>
  <h1>员工管理</h1>
  <div class="container">
    <el-form :inline="true" :model="searchEmp" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input v-model="searchEmp.name" placeholder="请输入员工姓名" clearable />
      </el-form-item>
      <el-form-item label="性别">
        <el-select
          v-model="searchEmp.gender"
          placeholder="请选择性别"
          clearable
        >
          <el-option label="男" value="1" />
          <el-option label="女" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="入职时间">
        <el-date-picker
        v-model="searchEmp.data"
        type="daterange"
        range-separator="-"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        :size="size"
        value-format="YYYY-MM-DD"
      />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search()">查询</el-button>
        <el-button type="info" @click="clear()">清空</el-button>
      </el-form-item>
    </el-form>
  </div>

  <div class="container-menu">
    <el-button type="primary" @click="addEmp">新增员工</el-button>
    <el-button type="danger" @click="delEmps">批量删除</el-button>
  </div>
  <!-- {{ selectedEmps }} -->
  <div class="table"> 
    <el-table :data="empList" stripe style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"  align="center" />
      <el-table-column prop="name" label="姓名" width="120"  align="center" />
      <el-table-column label="性别" width="120"  align="center" >
        <template #default = "scope">
          <span v-if="scope.row.gender == 1">男</span>
          <span v-else>女</span>
        </template>
      </el-table-column>
      <el-table-column prop="image" label="头像" width="150"  align="center" >
        <template #default = "scope">
          <el-image
            style="width: 40px; height: 40px"
            :src="scope.row.image"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="deptName" label="所属部门" width="150"  align="center" />
      <el-table-column label="职位" width="150"  align="center" >
        <template #default = "scope">
          <span v-if="scope.row.job == 1">班主任</span>
          <span v-else-if="scope.row.job == 2">讲师</span>
          <span v-else-if="scope.row.job == 3">学工主管</span>
          <span v-else-if="scope.row.job == 4">教研主管</span>
          <span v-else-if="scope.row.job == 5">咨询师</span>
          <span v-else>其他</span>
        </template>
      </el-table-column>
      <el-table-column prop="entryDate" label="入职日期" width="300"  align="center" />
      <el-table-column prop="updateTime" label="最后操作时间"  width="300"  align="center" />
      <el-table-column label="操作"  align="center" >
        <template #default = "scope">
          <!-- {{ scope.row }} -->
          <el-button type="primary" size="small" @click="edit(scope.row.id)"><el-icon><Edit /></el-icon>&nbsp;编辑</el-button>
          <el-button type="danger" size="small" @click="delById(scope.row.id)"><el-icon><Delete /></el-icon>&nbsp;删除</el-button>
        </template> 
      </el-table-column>
  </el-table>
  </div>

  <div class="page">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 50, 100, 200]"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>

  <el-dialog v-model="dialogVisible" :title="dialogTitle">
      <el-form :model="employee" label-width="80px">
        <!-- 基本信息 -->
        <!-- 第一行 -->
         <!-- {{ employee }} -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名">
              <el-input v-model="employee.username" placeholder="请输入员工用户名，2-20个字"></el-input>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="employee.name" placeholder="请输入员工姓名，2-10个字"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="employee.gender" placeholder="请选择性别" style="width: 100%;">
                <el-option v-for="value in genders" :key="value.value" :label="value.name" :value="value.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="employee.phone" placeholder="请输入员工手机号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位">
              <el-select v-model="employee.job" placeholder="请选择职位" style="width: 100%;">
                <el-option v-for="value in jobs" :key="value.value" :label="value.name" :value="value.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪资">
              <el-input v-model="employee.salary" placeholder="请输入员工薪资"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属部门">
              <el-select v-model="employee.deptId" placeholder="请选择部门" style="width: 100%;">
                <el-option v-for="value in depts" :key="value.id"  :label="value.name" :value="value.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期">
              <el-date-picker v-model="employee.entryDate" type="date" style="width: 100%;" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
                :headers="{'token': token}"
                >
                <img v-if="employee.image" :src="employee.image" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        

        <!-- 工作经历 -->
        <!-- 第六行 -->
        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="工作经历">
              <el-button type="success" size="small" @click="addexpr()">+ 添加工作经历</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 第七行 ...  工作经历 -->
        <el-row :gutter="3" v-for="(item,index) in employee.exprList">
          <el-col :span="10">
            <el-form-item size="small" label="时间" label-width="80px">
              <el-date-picker type="daterange" v-model="item.exprDate" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" ></el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item size="small"  label="公司" label-width="60px">
              <el-input placeholder="请输入公司名称" v-model="item.company"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item size="small"  label="职位" label-width="60px">
              <el-input placeholder="请输入职位" v-model="item.job"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="2">
            <el-form-item size="small" label-width="0px">
              <el-button type="danger" @click="delExpr(index)">删除</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <!-- 底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancle()">取消</el-button>
          <el-button type="primary" @click="save()">保存</el-button>
        </span>
      </template>
  </el-dialog>

</template>

<style scoped>

.container {
  margin-top: 15px;
}

.table {
  margin-top: 15px;
}

.page {
  margin-top: 15px;
}

.avatar {
  height: 40px;
}
.avatar-uploader .avatar {
  width: 78px;
  height: 78px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 78px;
  height: 78px;
  text-align: center;
  border-radius: 10px;
  /* 添加灰色的虚线边框 */
  border: 1px dashed var(--el-border-color);
}
</style>