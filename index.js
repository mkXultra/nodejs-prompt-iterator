const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// readfile system_prompt.txt
const systemPromptStr = fs.readFileSync('system_prompt.txt', 'utf8')
const startPromptStr = fs.readFileSync('first_prompt.txt', 'utf8')
const beforeMessage = fs.readFileSync('lastResponse.txt', 'utf8')
const model = "gpt-4"
const counterLimit = 45

const incrementMsg = {role: "user", content: "つづけて"}

async function main(){
  const message = []
  message.push(incrementMsg)
  let currentResponse = beforeMessage
  for (let i = 0; i < counterLimit; i++) {
    const chatCompletion = await caller(currentResponse,message)
    const content = chatCompletion.data.choices[0].message.content;
    // contentの中身をファイルに書き込む
    fs.writeFileSync('lastResponse.txt', content)

    // contentを行ごとに分割
    const lines = content.split('\n');

    // 最初の3行を削除
    lines.splice(0, 3);

    // 残りの行を結合して新しい文字列を作成
    let newContent = lines.join('\n');
    // 最後の文字を確認して、改行がなければ追加
    if (newContent.slice(-1) !== '\n') {
        newContent += '\n';
    }

    // 文字列をファイルに書き込む
    fs.appendFileSync('output.csv', newContent, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
    currentResponse = content
  }  

}

function caller(beforeMsg,message){
  const messages = [
      {role: "system", content: systemPromptStr},
      {role: "user", content: startPromptStr},
      {role: "assistant", content: beforeMsg},
      ...message
    ]
  return openai.createChatCompletion({
    model,
    messages,
  });
}

main()