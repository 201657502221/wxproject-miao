// components/search/search.js

const db = wx.cloud.database()

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isFocus:false,
    historyList:[],
    searchList:[],
    val:''
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleFocus(){
      wx.getStorage({
        key: 'searchHistory',
        success: (res)=> {
          this.setData({
            historyList:res.data
          })
        }
      })
      this.setData({
        isFocus:true
      })
    },
    handleCancel(){
      this.setData({
        isFocus:false,
        val:''
      })
    },
    handleEnter(ev){              //搜索并添加搜索记录
      let value = ev.detail.value;
      let cloneHistoryList = [...this.data.historyList];    
          //...展开运算符，在此仅复制数据，不产生赋值关系
      cloneHistoryList.unshift(value);
      wx.setStorage({
        key:"searchHistory",
        data: [...new Set(cloneHistoryList)]   //去重并写入数据
      })
      this.changeSearchList(value)    //产生搜索项
    },
    historyDelete(){
      wx.showModal({
        title: '提示',
        content: '是否删除历史记录',
        confirmText:"删除",
        success: (res)=> {
          if (res.confirm) {
            wx.removeStorage({
              key: 'searchHistory',
              success: (res)=> {
                this.setData({
                  historyList:[]
                })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    changeSearchList(value){      //搜索项函数
      db.collection("users").where({
        nickName:db.RegExp({
          regexp: value,
          options: 'i',
        })
      }).field({
        userPhoto:true,
        nickName:true
      }).get().then((res)=>{
        if (res.data.length) {
          this.setData({
            searchList:res.data
          })
        } else {
          this.setData({
            searchList:[]
          })
          wx.showToast({
            title: '暂无相关联系人',
            icon:'none',
            duration:1000
          })
        }
      })
    },
    handleHistoryBtn(ev){             //点击历史直接搜索
      let val = ev.target.dataset.val
      this.changeSearchList(val)
    },
  }
})
