package com.site.blog.my.core.dao;

import com.site.blog.my.core.entity.BlogComment;
import java.util.List;
import java.util.Map;

public interface BlogCommentMapper {
    int deleteByPrimaryKey(Long commentId);

    int insert(BlogComment record);

    int insertSelective(BlogComment record);

    /*通过主键来查询整个博客评论的内容*/
    BlogComment selectByPrimaryKey(Long commentId);

    int updateByPrimaryKeySelective(BlogComment record);

    int updateByPrimaryKey(BlogComment record);

    List<BlogComment> findBlogCommentList(Map map);

    int getTotalBlogComments(Map map);

    /*检查评论是否审核通过*/
    int checkDone(Integer[] ids);

    int deleteBatch(Integer[] ids);
}