$(function () {
    $("#jqGrid").jqGrid({
        url: '/admin/comments/list',
        datatype: "json",
        colModel: [
            {label: 'id', name: 'commentId', index: 'commentId', width: 50, key: true, hidden: true},
            {label: '评论内容', name: 'commentBody', index: 'commentBody', width: 120},
            {label: '评论时间', name: 'commentCreateTime', index: 'commentCreateTime', width: 60},
            {label: '评论人名称', name: 'commentator', index: 'commentator', width: 60},
            {label: '评论人邮箱', name: 'email', index: 'email', width: 90},
            {label: '状态', name: 'commentStatus', index: 'commentStatus', width: 60, formatter: statusFormatter},
            {label: '回复内容', name: 'replyBody', index: 'replyBody', width: 120},
        ],
        height: 700,
        rowNum: 10,
        rowList: [10, 20, 50],
        styleUI: 'Bootstrap',
        loadtext: '信息读取中...',
        rownumbers: false,
        rownumWidth: 20,
        autowidth: true,
        multiselect: true,
        /*构建分页条*/
        pager: "#jqGridPager",
        jsonReader: {
            root: "data.list",  /*从后端接受过来的评论数据*/
            page: "data.currPage", /*当前页*/
            total: "data.totalPage", /*总页码*/
            records: "data.totalCount" /*总记录数*/
        },
        /*发送给服务端的数据*/
        prmNames: {
            page: "page",
            rows: "limit",
            order: "order",
        },
        gridComplete: function () {
            //隐藏grid底部滚动条
            $("#jqGrid").closest(".ui-jqgrid-bdiv").css({"overflow-x": "hidden"});
        }
    });
    /*resize事件会在元素的尺寸大小被调整时触发。该事件常用于window对象(浏览器窗口)或框架页面。*/
    $(window).resize(function () {
        /*setGridWidth()方法的作用是动态改变表格的宽度*/
        $("#jqGrid").setGridWidth($(".card-body").width());
    });

    /*这里也有评论状态的判断，如果是0表示待审核，1表示已审核通过*/
    function statusFormatter(cellvalue) {
        if (cellvalue == 0) {
            return "<button type=\"button\" class=\"btn btn-block btn-secondary btn-sm\" style=\"width: 80%;\">待审核</button>";
        }
        else if (cellvalue == 1) {
            return "<button type=\"button\" class=\"btn btn-block btn-success btn-sm\" style=\"width: 80%;\">已审核</button>";
        }
    }

});

/**
 * jqGrid重新加载
 */
function reload() {
    /*getGridParam:返回请求的参数信息*/
    var page = $("#jqGrid").jqGrid('getGridParam', 'page');
    /*setGridParam:设置grid的参数*/
    $("#jqGrid").jqGrid('setGridParam', {
        page: page
        /*trigger("reloadGrid"):重新加载当前表格，也会向服务器发起新的请求*/
    }).trigger("reloadGrid");
}

/**
 * 批量审核
 */
/*这个js有前端页面comment中的批量审核按钮触发，它已经绑定了onclick()事件*/
function checkDoneComments() {
    var ids = getSelectedRows();
    if (ids == null) {
        /*如果选中的多行记录id为空，直接结束事件*/
        return;
    }
    swal({
        title: "确认弹框",
        text: "确认审核通过吗?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((flag) => {
            if (flag) {
                $.ajax({
                    type: "POST",
                    url: "/admin/comments/checkDone",
                    contentType: "application/json",
                    data: JSON.stringify(ids),
                    success: function (r) {
                        if (r.resultCode == 200) {
                            swal("审核成功", {
                                icon: "success",
                            });
                            $("#jqGrid").trigger("reloadGrid");
                        } else {
                            swal(r.message, {
                                icon: "error",
                            });
                        }
                    }
                });
            }
        }
    );
}

/**
 * 批量删除
 */
function deleteComments() {
    var ids = getSelectedRows();
    if (ids == null) {
        return;
    }
    swal({
        title: "确认弹框",
        text: "确认删除这些评论吗?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((flag) => {
            if (flag) {
                $.ajax({
                    type: "POST",
                    url: "/admin/comments/delete",
                    contentType: "application/json",
                    data: JSON.stringify(ids),
                    success: function (r) {
                        if (r.resultCode == 200) {
                            swal("删除成功", {
                                icon: "success",
                            });
                            $("#jqGrid").trigger("reloadGrid");
                        } else {
                            swal(r.message, {
                                icon: "error",
                            });
                        }
                    }
                });
            }
        }
    );
}

/**
 * 这个是与回复有关的函数,
 * 它在comment.html页面被回复按钮调用(onclick="reply()")
 */
function reply() {
    /*getSelectedRow是获取选中的一条记录*/
    var id = getSelectedRow();
    if (id == null) {
        return;
    }
    /*getRowData:返回指定行的数据,返回数据类型为name:value
    * name为colModel中的名称，value为所在行的列的值
    * */
    var rowData = $("#jqGrid").jqGrid('getRowData', id);
    console.log(rowData);
    /*rowData.commentStatus.indexOf('待审核') > -1  这行代码的意思是 待审核这三个字是存在的，
    * 如果调用以上方法返回的值是-1，代表待审核这三个字是不存在的。
    * ----------------------------------------------------------------------------
    * 如果现在评论是待审核状态的，那么会返回-1，此时结果为true,走下面的函数
    * 如果评论是已审核状态，那么就不会返回-1，结果为false,就不会走这个if条件判断语句
    * */
    if (rowData.commentStatus.indexOf('待审核') > -1) {
        swal("请先审核该评论再进行回复!", {
            icon: "warning",
        });
        return;
    }
    /*下面两行代码的作用是弹出模态框，显示空白的回复区域*/
    $("#replyBody").val('');
    $('#replyModal').modal('show');
}

/**
 * 这个是模态框里面的确认按钮绑定了鼠标单击事件
 * 当用户选中任意一条评论后，点击回复按钮后，就会触发下面的单击事件
 */
$('#saveButton').click(function () {
    /*获取输入框中的评论内容*/
    var replyBody = $("#replyBody").val();
    /*正则匹配2-100位的中英文字符串*/
    if (!validCN_ENString2_100(replyBody)) {
        swal("请输入符合规范的回复信息!", {
            icon: "warning",
        });
        return;
    } else {
        /*当评论满足验证要求,才执行下面的内容*/
        var url = '/admin/comments/reply';
        var id = getSelectedRow();
        var params = {"commentId": id, "replyBody": replyBody}
        $.ajax({
            type: 'POST',//方法类型
            url: url,
            data: params,
            success: function (result) {
                if (result.resultCode == 200) {
                    $('#replyModal').modal('hide');
                    swal("回复成功", {
                        icon: "success",
                    });
                    reload();
                }
                else {
                    $('#replyModal').modal('hide');
                    swal(result.message, {
                        icon: "error",
                    });
                }
                ;
            },
            error: function () {
                swal("操作失败", {
                    icon: "error",
                });
            }
        });
    }
});
