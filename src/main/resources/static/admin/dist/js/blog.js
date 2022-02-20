$(function () {
    $("#jqGrid").jqGrid({
        url: '/admin/blogs/list',
        /*datatype是从服务端返回的数据类型，默认是xml*/
        datatype: "json",
        /*colModel是jqGrid里面最重要的一个属性，设置表格列的属性,
          label:如果colNames为空，则用此值来作为列的显示名称
          name:表格列的名称，所有关键字，保留字都不能作为名称
          index:索引，其和后台交互的参数为sidx
          width:默认列的宽度
          key:当从服务器端返回的数据中没有id时，将此作为唯一rowid使用只有一个列可以做这项设置。
                如果设置多于一个，那么只选取第一个，其他被忽略
          hidden:在初始化表格时是否要隐藏此列
          ---------
          formatter:类型是mixed;对列进行格式化时设置的函数名或者类型
          */
        colModel: [
            {label: 'id', name: 'blogId', index: 'blogId', width: 50, key: true, hidden: true},
            {label: '标题', name: 'blogTitle', index: 'blogTitle', width: 140},
            {label: '预览图', name: 'blogCoverImage', index: 'blogCoverImage', width: 120, formatter: coverImageFormatter},
            {label: '浏览量', name: 'blogViews', index: 'blogViews', width: 60},
            {label: '状态', name: 'blogStatus', index: 'blogStatus', width: 60, formatter: statusFormatter},
            {label: '博客分类', name: 'blogCategoryName', index: 'blogCategoryName', width: 60},
            {label: '添加时间', name: 'createTime', index: 'createTime', width: 90}
        ],
        /*表格高度，可以是数字，像素值或者百分比*/
        height: 700,
        /*int类型，在grid上显示记录条数，这个参数是要被传递到后台*/
        rowNum: 10,
        /*一个数组用来调整表格显示的记录数，此参数值会替代rowNum参数值传给服务器端*/
        rowList: [10, 20, 50],
        styleUI: 'Bootstrap',
        /*当请求或者排序时所显示的文字内容*/
        loadtext: '信息读取中...',
        /*boolean类型，如果为true则会在表格左边新增一列，显示行顺序号，从1开始递增，此列名为'rn'.*/
        rownumbers: false,
        /*integer,如果rownumbers为true，则可以设置column的宽度*/
        rownumWidth: 20,
        /*boolean如果为true，则当表格在首次被创建时会根据父元素比例重新调整表格宽度*/
        autowidth: true,
        /*boolean:定义是否可以多选*/
        multiselect: true,
        /*string:定义翻页用到的导航栏，必须是有效的html元素，翻页工具栏可以放置在html页面任意位置*/
        pager: "#jqGridPager",
        /*array:描述json数据格式的数组*/
        jsonReader: {
            root: "data.list",
            page: "data.currPage",  /*当前页*/
            total: "data.totalPage",  /*总页数*/
            records: "data.totalCount" /*查询出的记录数*/
        },
        /*array:这里面的数据都发送到服务端*/
        prmNames: {
            page: "page",
            rows: "limit",
            order: "order",
        },
        /**/
        gridComplete: function () {
            //隐藏grid底部滚动条
            $("#jqGrid").closest(".ui-jqgrid-bdiv").css({"overflow-x": "hidden"});
        }
    });

    $(window).resize(function () {
        /*setGridWidth:动态改变表格的宽度*/
        $("#jqGrid").setGridWidth($(".card-body").width());
    });

    function coverImageFormatter(cellvalue) {
        return "<img src='" + cellvalue + "' height=\"120\" width=\"160\" alt='coverImage'/>";
    }

    function statusFormatter(cellvalue) {
        if (cellvalue == 0) {
            return "<button type=\"button\" class=\"btn btn-block btn-secondary btn-sm\" style=\"width: 50%;\">草稿</button>";
        }
        else if (cellvalue == 1) {
            return "<button type=\"button\" class=\"btn btn-block btn-success btn-sm\" style=\"width: 50%;\">发布</button>";
        }
    }

});

/**
 * 搜索功能
 */
function search() {
    //标题关键字
    var keyword = $('#keyword').val();
    if (!validLength(keyword, 20)) {
        swal("搜索字段长度过大!", {
            icon: "error",
        });
        return false;
    }
    //数据封装
    var searchData = {keyword: keyword};
    //传入查询条件参数
    $("#jqGrid").jqGrid("setGridParam", {postData: searchData});
    //点击搜索按钮默认都从第一页开始
    $("#jqGrid").jqGrid("setGridParam", {page: 1});
    //提交post并刷新表格
    $("#jqGrid").jqGrid("setGridParam", {url: '/admin/blogs/list'}).trigger("reloadGrid");
}

/**
 * jqGrid重新加载
 */
function reload() {
    var page = $("#jqGrid").jqGrid('getGridParam', 'page');
    $("#jqGrid").jqGrid('setGridParam', {
        page: page
    }).trigger("reloadGrid");
}

function addBlog() {
    window.location.href = "/admin/blogs/edit";
}

function editBlog() {
    var id = getSelectedRow();
    if (id == null) {
        return;
    }
    window.location.href = "/admin/blogs/edit/" + id;
}

function deleteBlog() {
    var ids = getSelectedRows();
    if (ids == null) {
        return;
    }
    swal({
        title: "确认弹框",
        text: "确认要删除数据吗?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((flag) => {
            if (flag) {
                $.ajax({
                    type: "POST",
                    url: "/admin/blogs/delete",
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