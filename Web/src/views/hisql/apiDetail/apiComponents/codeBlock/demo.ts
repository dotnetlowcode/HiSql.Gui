export const demoTsCode = `export class FunParams{
    Name:string='';
}

export class FunResult{
    UserName:string='';
    Password:string='';
}

export const mainFun=async function(params:FunParams):Promise<FunResult>{
    //逻辑代码....


    return {
        UserName:params.Name,
        Password:''
    };
}`;
