using HiSql.GUI.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.TableTask
{
    public class TableTaskSaveRequest
    {
        public TableTaskModel TableTask { get; set; }

    }


    public class TableTaskSaveResponse
    {
        public int ModifyCount { get; set; }
    }
}
