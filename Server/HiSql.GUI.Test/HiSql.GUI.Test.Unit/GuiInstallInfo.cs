using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Test.Unit
{
    internal class GuiInstallInfo
    {

        bool _isview = false;
        public string TabName { get; set; }

        public bool IsView { get => _isview; set => _isview = value; }
        public string ViewHiSql { get; set; }
        public string TabStructInfo { get; set; }

        public string TabDataInfo { get; set; }
    }

}
