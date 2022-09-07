using HiSql.GUI.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Repository.Interface
{
    public class HiApiInfo
    {
        public HiApiModelSimple Obj { get; set; }

        public List<HiApiBlockSimpleEntity> Blocks { get; set; }

        public List<HiApiParamEntitySimple> Param { get; set; }

    }


    public interface IHiApiRepository
    {
        HiApiInfo Get(string id);

        HiApiInfo Get(string apiName, string groupName);
    }
}
