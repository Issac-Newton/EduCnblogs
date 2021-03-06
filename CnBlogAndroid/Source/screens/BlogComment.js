import Config from '../config';
import api from '../api/api.js';
import {authData} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    FlatList,
    Button,
    Alert
} from 'react-native';
import {
    StackNavigator,
    TabNavigator,
} from 'react-navigation';
const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
// 博客评论页面
// 接受评论数量 CommentCount 和 博客名 blogApp 以及博文Id作为参数
// 这里定义一个用于粗略解决返回的评论字符串内包含无法解析的html标签的函数
function CommemtHandler(data){
    var s = data.split('');
    var result = '';
    var tag = 0;
    for(var i in s)
    {
        if(s[i]=='>')
        {
            tag = 0;
            if(s[i-1]=='/'&&s[i-2]=='r')
            {
                result+='\n';
            }
            continue;
        }
        if(s[i]=='<'||tag==1)
        {
            tag = 1;
            continue;
        }
        if(s[i]=='引'||(s[i]=='用'&&s[i-1]=='引'))
        {
            continue;
        }
        result+=s[i];
    }
    return result;
}
export default class BlogComment extends Component{
    constructor(props){
        super(props);
        this.state = {
            comments: [],
            isRequestSuccess: false,//初始认为页面请求失败，不渲染，否则会由于网络问题导致crash
        }
    }
    _isMounted;
    componentWillMount=()=>{
        this._isMounted=true;
        let url = 'https://api.cnblogs.com/api/blogs/'+this.props.navigation.state.params.blogApp
                +'/posts/'+this.props.navigation.state.params.Id+'/comments?pageIndex=1&pageSize='
                +this.props.navigation.state.params.CommentCount;
        Service.Get(url).then((jsonData)=>{
            if(jsonData!=='rejected')
            {
                this.setState({
                    isRequestSuccess: true,
                })
                if(this._isMounted){
                    this.setState({
                    comments: jsonData,
                })}
            }
        }).catch((error) => {
            ToastAndroid.show("网络请求失败，请检查连接状态！",ToastAndroid.SHORT);
        });
    }
    componentWillUnmount=()=>{
        this._isMounted=false;
    }
    UpdateData = ()=>{
        this.setState({
            isRequestSuccess: false,
        });
        this.componentWillMount();
    }
    _separator = () => {
        return <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }}/>;
    }
    _renderItem = (item)=>{
        let item1 = item;
        let {key,Body,Author,DateAdded,AuthorUrl,FaceUrl} = item1.item;
        return(
            <View style = {styles.listcontainer}>
                <View style = {{flex:1}}>
                    <Image source = {FaceUrl?{uri:FaceUrl}:require('../images/defaultface.png')} style = {styles.facestyle}/>
                </View>
                <View style = {styles.textcontainer}>
                    <Text style = {{fontSize: 15, fontWeight: 'bold', color: 'black'}}>{Author}</Text>
                    <Text style = {{color: 'black', fontSize: 12}}>{CommemtHandler(Body)}</Text>
                    <View style = {{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'flex-start'
                    }}>
                        <Text style = {{fontSize: 10, color: 'black',textAlign:'right',flex:1}}>
                            {'评论于: '+DateAdded.split('T')[0]+' '+DateAdded.split('T')[1].substring(0,8)}
                        </Text>
                    </View>
                </View>
            </View>
        )
    }
    render(){
        var data = [];
        if(this.state.isRequestSuccess){
        for(var i in this.state.comments)
        {
            data.push({
                key: this.state.comments[i].Id,
                Body: this.state.comments[i].Body,
                Author: this.state.comments[i].Author,
                DateAdded: this.state.comments[i].DateAdded,
                AuthorUrl: this.state.comments[i].AuthorUrl,
                FaceUrl: this.state.comments[i].FaceUrl,
            })
        }}
        return (
            <View style = {styles.container}>
                <FlatList
                    ItemSeparatorComponent={this._separator}
                    renderItem={this._renderItem}
                    data={data}
                    onRefresh = {this.UpdateData}
                    refreshing= {false}
                />
                {this.state.isRequestSuccess===false?null:
                <TouchableOpacity
                    style= {styles.button}
                    onPress={()=>this.props.navigation.navigate('CommentAdd',
                            {blogApp: this.props.navigation.state.params.blogApp,
                            Id: this.props.navigation.state.params.Id,
                            CommentCount: this.props.navigation.state.params.CommentCount})}
                >
	               <Text style = {{fontSize: 20, color: 'rgb(51,51,51)'}} accessibilityLabel = 'BlogComment_addreplyComment'>添加/回复评论</Text>
                </TouchableOpacity>
            	}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    listcontainer: {
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems: 'flex-start',  
        flex:1,
        backgroundColor: 'white',
        width: screenWidth-20,
        marginLeft: 8,
        marginRight: 12,
        marginBottom: 5,
    },
    facestyle: {
        width: 40,
        height: 40,
        marginTop: 5,
    },
    textcontainer: {
        justifyContent:'flex-start',
        alignItems: 'flex-start',  
        flex: 6,
        backgroundColor: 'white',
    },
    button: {
        height: screenHeight/12,
        width: screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0,
        backgroundColor: '#1C86EE',  
    }
});