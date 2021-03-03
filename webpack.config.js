module.exports = {
    entry: {
        'pow': './pow-test.js'
    },
    output: {
        path: __dirname,
        filename: '[name].min.js',
        library: 'pow'
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    performance: { hints: false }
};