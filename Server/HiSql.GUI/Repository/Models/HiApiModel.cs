using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Repository.Models
{

    public class HiApiBlockSimpleEntity
    {
        /// <summary>
        /// ApiBodyId[必填参数]
        /// <summary>
        public string ApiBodyId { get; set; }

        /// <summary>
        /// ApiId
        /// <summary>
        public string ApiId { get; set; }

        /// <summary>
        /// Sql
        /// <summary>
        public string Sql { get; set; }

        /// <summary>
        /// 是否开启分页
        /// </summary>
        public bool IsPageList { get; set; }

        /// <summary>
        /// 是否需要输出结果
        /// </summary>
        public bool OutResult { get; set; }

        /// <summary>
        /// 结果输出键
        /// </summary>
        public string BlockName { get; set; }

        /// <summary>
        /// 排序字段
        /// </summary>
        public string OrderByField { get; set; }

    }


    public class HiApiBlockEntity : HiApiBlockSimpleEntity
    {
        /// <summary>
        /// SortNum
        /// <summary>
        public int SortNum { get; set; }


        /// <summary>
        /// CreateTime
        /// <summary>
        public DateTime CreateTime { get; set; }

        /// <summary>
        /// CreateName
        /// <summary>
        public string CreateName { get; set; }

        /// <summary>
        /// ModiTime
        /// <summary>
        public DateTime ModiTime { get; set; }

        /// <summary>
        /// ModiName
        /// <summary>
        public string ModiName { get; set; }

        /// <summary>
        /// 输出结果
        /// <summary>
        public bool OutResult { get; set; }

        /// <summary>
        /// 测试结果
        /// <summary>
        public string TestResult { get; set; }
    }


    public enum ParamFieldType
    {
        String = 0,
        Number = 1,
        Date = 2,
        Boolean = 3
    }


    public class HiApiParamEntitySimple
    {
        /// <summary>
        /// Title[必填参数]
        /// <summary>
        public string Title { get; set; }

        /// <summary>
        /// ApiId[必填参数]
        /// <summary>
        public string ApiId { get; set; }

        /// <summary>
        /// ApiBodyId[必填参数]
        /// <summary>
        public string ApiBodyId { get; set; }

        /// <summary>
        /// Type
        /// <summary>
        public string Type { get; set; }

        /// <summary>
        /// Description
        /// <summary>
        public string Description { get; set; }

        /// <summary>
        /// IsRequired
        /// <summary>
        public bool IsRequired { get; set; }

        /// <summary>
        /// 是否为集合
        /// </summary>
        public bool IsArray { get; set; }

        /// <summary>
        /// 是入参还是出参
        /// <summary>
        public string FieldType { get; set; }

        /// <summary>
        /// 值来源
        /// <summary>
        public string ValueFrom { get; set; }

        /// <summary>
        /// 是否是全局参数
        /// <summary>
        public bool IsMainParam { get; set; }

        /// <summary>
        /// 默认值
        /// </summary>
        public string DefaultValue { get; set; }
    }

    public class HiApiParamEntity : HiApiParamEntitySimple
    {
        /// <summary>
        /// SortNum
        /// <summary>
        public int SortNum { get; set; }

        /// <summary>
        /// CreateTime
        /// <summary>
        public DateTime CreateTime { get; set; }

        /// <summary>
        /// CreateName
        /// <summary>
        public string CreateName { get; set; }

        /// <summary>
        /// ModiTime
        /// <summary>
        public DateTime ModiTime { get; set; }

        /// <summary>
        /// ModiName
        /// <summary>
        public string ModiName { get; set; }

        /// <summary>
        /// DemoValue
        /// <summary>
        public string DemoValue { get; set; }

    }

    public class HiApiModelSimple
    {
        /// <summary>
        /// ApiId[必填参数]
        /// <summary>
        public string ApiId { get; set; }

        /// <summary>
        /// Type
        /// <summary>
        public string Type { get; set; }

        /// <summary>
        /// IsPublish
        /// <summary>
        public int IsPublish { get; set; }

        /// <summary>
        /// Name
        /// <summary>
        public string Name { get; set; }
    }


    public class HiApiModel : HiApiModelSimple
    {

        /// <summary>
        /// SortNum
        /// <summary>
        public int SortNum { get; set; }

        /// <summary>
        /// CreateTime
        /// <summary>
        public DateTime CreateTime { get; set; }

        /// <summary>
        /// CreateName
        /// <summary>
        public string CreateName { get; set; }

        /// <summary>
        /// ModiTime
        /// <summary>
        public DateTime ModiTime { get; set; }

        /// <summary>
        /// ModiName
        /// <summary>
        public string ModiName { get; set; }

    }

}
