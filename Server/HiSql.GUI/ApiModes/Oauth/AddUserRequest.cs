using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.ApiModes.Oauth
{
    public class AddUserRequest
    {
        public string UserName { get; set; }

        public string Password { get; set; }

        public string RId { get; set; }

        public string GId { get; set; }
    }

    public class AddUserResponse
    {

    }
}
