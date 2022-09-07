using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Repository.Models
{
    public class HiUserAuthModel
    {
        /// <summary>
        /// MId
        /// <summary>
        public string MId { get; set; }

        /// <summary>
        /// RefValues
        /// <summary>
        public string RefValues { get; set; }

        /// <summary>
        /// UId
        /// <summary>
        public string UId { get; set; }

        /// <summary>
        /// 资源Id
        /// </summary>
        public string ResId { get; set; }

        /// <summary>
        /// 当前用户角色
        /// </summary>
        public string UserRId { get; set; }
    }
}
