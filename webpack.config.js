const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
//webpack的所有配置信息
module.exports = {
    optimization: {
        minimize: false // 关闭代码压缩，可选
    },
    //入口文件
    entry: "./src/index.ts",
    //指定打包文件所在目录
    output: {
        path: path.resolve(__dirname, "dist"),//指定打包文件的目录
        filename: "bundle.js",//打包文件的名字
        environment: {
            arrowFunction: false // 关闭webpack的箭头函数，可选
        }
    },
    //用来指定那些模块可以用来备注引入
    resolve: {
        extensions: [".ts", ".js"]
    },
    //指定webpack的打包使用的模块
    module: {
        rules: [
            {
                test: /\.ts$/,//规则生效的文件
                use: {
                    loader: "ts-loader"   //要使用的loader  
                },
                exclude: /node_modules/  //编译排除的文件
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    },

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            // title: 'TS测试'
            template: './index.html'
        }),
    ]
}
