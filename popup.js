// @Date    : 2020-09-12 16:26:48
// @Author  : residuallaugh
var key = ["ip","ip_port","domain","path","incomplete_path","url","static","sfz","mobile","mail","jwt","algorithm","secret"]

function init_copy() {
    var elements = document.getElementsByClassName("copy");
    if(elements){
        for (var i=0, len=elements.length|0; i<len; i=i+1|0) {
            let ele_name = elements[i].name;
            let ele_id = elements[i].id;
            elements[i].onclick=function () {
                var inp =document.createElement('textarea');
                document.body.appendChild(inp)
                var copytext = document.getElementById(ele_name).textContent;
                if (ele_id == "path_url_button"){
                    Promise.all([getCurrentTab().then(function x(tab){
                        // console.log(tab);
                        if(tab == undefined){
                            alert("请点击原页面后再复制：）")
                            return;
                        }
                        var url = new URL(tab.url)
                        var path_list = copytext.split('\n')
                        copytext = ""
                        for (var i = path_list.length - 1; i >= 0; i--) {
                            if(path_list[i][0] == '.'){
                                copytext += url.origin+'/'+path_list[i]+'\n';
                            }else{
                                copytext += url.origin+path_list[i]+'\n';
                            }
                        }
                        inp.value = copytext.slice(0, -1);
                        inp.select();
                        // console.log(copytext)
                        document.execCommand('copy',false);
                        // inp.remove();
                    })]).then(res=> inp.remove())
                    // alert('复制成功');
                    return ;
                }
                inp.value = copytext;
                inp.select();
                document.execCommand('copy',false);
                inp.remove();
                // alert('复制成功');
            }
        }
    }
};


async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function show_info(result_data) {
    for (var k in key){
        if (result_data[key[k]]){
            // console.log(result_data[key[k]])
            let p="";
            for(var i in result_data[key[k]]){
                p = p + result_data[key[k]][i] +'\n'
            }
            document.getElementById(key[k]).style.whiteSpace="pre";
            document.getElementById(key[k]).textContent=p;
        }
    }
}

getCurrentTab().then(function get_info(tab) {
    // console.log("findsomething_result_"+tab.url)
    chrome.storage.local.get(["findsomething_result_"+tab.url], function(result_data) {
        if (result_data==undefined){
            sleep(100);
            get_info(tab);
            return;
        }
        result_data = result_data["findsomething_result_"+tab.url]
        // console.log(result_data)
        if(result_data == undefined || result_data['done']!='done'){
            // console.log('还未提取完成');
            if(result_data && result_data.donetasklist){
                // console.log("findsomething_result_"+tab.url)
                chrome.storage.local.get(["findsomething_result_"+tab.url], show_info(result_data));
                // show_info(result_data);
                document.getElementById('taskstatus').textContent = "处理中.."+result_data['donetasklist'].length+"/"+result_data['tasklist'].length;
            }else{
                document.getElementById('taskstatus').textContent = "处理中..";
            }
            sleep(100);
            get_info(tab);
            return;
        }
        document.getElementById('taskstatus').textContent = "处理完成："+result_data['donetasklist'].length+"/"+result_data['tasklist'].length;
        chrome.storage.local.get(["findsomething_result_"+tab.url], show_info(result_data));
        // show_info(result_data);
        // 结果不一致继续刷新
        // if(result_data['donetasklist'].length!=result_data['tasklist'].length){
        //     get_info(tab);
        // }
        return;
    });
});


init_copy();