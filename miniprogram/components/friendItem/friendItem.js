// components/removeList/removeList.js

const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    messageId : String
  },

  /**
   * 组件的初始数据
   */
  data: {
    userMessage : {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    removeFriend(){
      wx.showModal({
        title:"提示消息",
        content:"删除好友",
        confirmText:"确定",
        success:(res)=>{
          if (res.confirm) {
            app.userInfo.friendList = app.userInfo.friendList.filter((val,i)=>{
              return val != this.data.messageId
            });
            //更新自己的friendList
            db.collection('users').where({
              _id: app.userInfo._id
            }).field({
              friendList:true
            }).get().then((res) => {
              let list = res.data[0].friendList;
              list = list.filter((val, i) => {    //过滤掉已删除的好友id
                return val != this.data.messageId
              });
              db.collection("users").doc(app.userInfo._id).update({
                data:{
                  friendList:list
                }
              }).then((res)=>{});

              //更新对方的friendList,用云函数
              db.collection("users").where({
                _id: this.data.messageId
              }).field({
                friendList:true
              }).get().then((res)=>{
                let prolist = res.data[0].friendList;
                prolist = list.filter((val, i) => {    //过滤掉自己的id
                  return val != app.userInfo._id
                });
                wx.cloud.callFunction({
                  name:"update",
                  data:{
                    collection:"users",
                    doc:this.data.messageId,
                    data:{
                      friendList:prolist
                    }
                  }
                }).then((res) => {
                  this.triggerEvent('myevent', list);   //自定义函数向父组件传值
                })
                wx.showToast({
                  title: '删除成功',
                })
              })
            });
          } else {
            console.log("取消")
          }
        }
      })
    }
  },

  lifetimes: {
    attached: function () {   //页面加载获取数据
      db.collection('users').doc(this.data.messageId).field({
        userPhoto : true,
        nickName : true
      }).get().then((res)=>{
        this.setData({
          userMessage : res.data
        });
      });
    }
  }
})
