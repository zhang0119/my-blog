var blogEditor;
// Tags Input
/*这行代码定义了文章标签栏的格式和默认文本值*/
$('#blogTags').tagsInput({
    width: '100%',
    height: '38px',
    defaultText: '文章标签'
});

//Initialize Select2 Elements
/*这个代码主要是与select2插件有关的*/
$('.select2').select2()

/*$(function(){}) 是在DOM加载完成后执行的回调函数，并且只会执行一次*/
$(function () {
    /*editormd的初始化,下面的*/
    /*这里的blog-editormd就是上面div的id属性值*/
    blogEditor = editormd("blog-editormd", {
        width: "100%",
        height: 640,
        syncScrolling: "single",
        /*你的路径*/
        path: "/admin/plugins/editormd/lib/",
        toolbarModes: 'full',
        /**图片上传配置*/
        imageUpload: true,
        /*图片上传的格式*/
        imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
        /*你的controller里为上传图片所设计的路径*/
        imageUploadURL: "/admin/blogs/md/uploadfile",
        onload: function (obj) { //上传成功之后的回调
        }
    });

    // 编辑器粘贴上传(下面的代码都是固定格式，直接复制粘贴使用即可!)
    /*开启图片上传并且实现拖拽剪切复制粘贴上传图片*/
    document.getElementById("blog-editormd").addEventListener("paste", function (e) {
        var clipboardData = e.clipboardData;
        if (clipboardData) {
            var items = clipboardData.items;
            if (items && items.length > 0) {
                /*搜索剪切板items*/
                for (var item of items) {
                    if (item.type.startsWith("image/")) {
                        var file = item.getAsFile();
                        if (!file) {
                            alert("请上传有效文件");
                            return;
                        }
                        var formData = new FormData();
                        formData.append('file', file);
                        var xhr = new XMLHttpRequest();
                        xhr.open("POST", "/admin/upload/file");
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                var json=JSON.parse(xhr.responseText);
                                if (json.resultCode == 200) {
                                    blogEditor.insertValue("![](" + json.data + ")");
                                } else {
                                    alert("上传失败");
                                }
                            }
                        }
                        xhr.send(formData);
                    }
                }
            }
        }
    });

    /*上传封面按钮的js, 这个按钮的id:uploadCoverImage
    * 这里的文件上传使用的是ajax来实现的
    * */
    new AjaxUpload('#uploadCoverImage', {
        /*服务器上传脚本的位置*/
        action: '/admin/upload/file',
        /*上传文件的名字*/
        name: 'file',
        /*选择文件后立即提交*/
        autoSubmit: true,
        /*期望从服务器返回的数据类型*/
        responseType: "json",
        /*在文件上传之前回调，你可以返回false取消上传*/
        onSubmit: function (file, extension) {
            if (!(extension && /^(jpg|jpeg|png|gif)$/.test(extension.toLowerCase()))) {
                alert('只支持jpg、png、gif格式的文件！');
                return false;
            }
        },
        /*当文件上传完成后触发，不要使用false字符串作为相应*/
        onComplete: function (file, r) {
            if (r != null && r.resultCode == 200) {
                $("#blogCoverImage").attr("src", r.data);
                $("#blogCoverImage").attr("style", "width: 128px;height: 128px;display:block;");
                return false;
            } else {
                alert("error");
            }
        }
    });
});

/*保存文章按钮的js，已看完*/
$('#confirmButton').click(function () {
    var blogTitle = $('#blogName').val();
    var blogSubUrl = $('#blogSubUrl').val();
    var blogCategoryId = $('#blogCategoryId').val();
    var blogTags = $('#blogTags').val();
    var blogContent = blogEditor.getMarkdown();
    if (isNull(blogTitle)) {
        swal("请输入文章标题", {
            icon: "error",
        });
        return;
    }
    if (!validLength(blogTitle, 150)) {
        swal("标题过长", {
            icon: "error",
        });
        return;
    }
    if (!validLength(blogSubUrl, 150)) {
        swal("路径过长", {
            icon: "error",
        });
        return;
    }
    if (isNull(blogCategoryId)) {
        swal("请选择文章分类", {
            icon: "error",
        });
        return;
    }
    if (isNull(blogTags)) {
        swal("请输入文章标签", {
            icon: "error",
        });
        return;
    }
    if (!validLength(blogTags, 150)) {
        swal("标签过长", {
            icon: "error",
        });
        return;
    }
    if (isNull(blogContent)) {
        swal("请输入文章内容", {
            icon: "error",
        });
        return;
    }
    if (!validLength(blogTags, 100000)) {
        swal("文章内容过长", {
            icon: "error",
        });
        return;
    }
    $('#articleModal').modal('show');
});

/*模态框里面的确认按钮的js*/
$('#saveButton').click(function () {
    var blogId = $('#blogId').val();
    var blogTitle = $('#blogName').val();
    var blogSubUrl = $('#blogSubUrl').val();
    var blogCategoryId = $('#blogCategoryId').val();
    var blogTags = $('#blogTags').val();
    var blogContent = blogEditor.getMarkdown();
    var blogCoverImage = $('#blogCoverImage')[0].src;
    var blogStatus = $("input[name='blogStatus']:checked").val();
    var enableComment = $("input[name='enableComment']:checked").val();
    if (isNull(blogCoverImage) || blogCoverImage.indexOf('img-upload') != -1) {
        swal("封面图片不能为空", {
            icon: "error",
        });
        return;
    }
    /*定义了请求的url*/
    var url = '/admin/blogs/save';
    var swlMessage = '保存成功';
    var data = {
        "blogTitle": blogTitle, "blogSubUrl": blogSubUrl, "blogCategoryId": blogCategoryId,
        "blogTags": blogTags, "blogContent": blogContent, "blogCoverImage": blogCoverImage, "blogStatus": blogStatus,
        "enableComment": enableComment
    };
    /*这个地方做了一个判断，即如果有blogId，则表明这是一个修改博客操作
    * 即通过判断是否有blogId，来确定是否是新增还是编辑博客页面
    * */
    if (blogId > 0) {
        url = '/admin/blogs/update';
        swlMessage = '修改成功';
        data = {
            "blogId": blogId,
            "blogTitle": blogTitle,
            "blogSubUrl": blogSubUrl,
            "blogCategoryId": blogCategoryId,
            "blogTags": blogTags,
            "blogContent": blogContent,
            "blogCoverImage": blogCoverImage,
            "blogStatus": blogStatus,
            "enableComment": enableComment
        };
    }
    console.log(data);

    $.ajax({
        type: 'POST',//方法类型
        url: url,
        data: data,
        /*这里的result数据是接受从服务端返回到前端的数据
        * result其实里面的数据就是：
        * 1.resultCode:200
        * 2.message:添加成功
        * */
        success: function (result) {
            if (result.resultCode == 200) {
                //成功
                /*articleModal是模态框的id*/
                $('#articleModal').modal('hide');
                swal({
                    title: swlMessage,
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: '返回博客列表',
                    confirmButtonClass: 'btn btn-success',
                    buttonsStyling: false
                }).then(function () {
                    /*保存成功，接着跳转到博客的主页面*/
                    window.location.href = "/admin/blogs";
                })
            }
            else {
                //失败
                $('#articleModal').modal('hide');
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
});

/*返回文章列表的js*/
$('#cancelButton').click(function () {
    window.location.href = "/admin/blogs";
});

/**
 * 随机封面功能
 */
$('#randomCoverImage').click(function () {
    /*Math.random()这个函数会随机返回0和1之间*/
    var rand = parseInt(Math.random() * 40 + 1);
    $("#blogCoverImage").attr("src", '/admin/dist/img/rand/' + rand + ".jpg");
    $("#blogCoverImage").attr("style", "width:160px ;height: 120px;display:block;");
});
