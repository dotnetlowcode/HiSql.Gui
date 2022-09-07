using HiSql.GUI.Repository.Models;
using System.Threading.Tasks;

namespace HiSql.GUI.Repository.HisSqlRepository
{
    public interface IHiUserInfoRepository
    {
        Task<HiUserInfoModel> GetUserInfo(string userName);
    }
}