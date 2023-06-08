import { OpenAI } from "langchain/llms"
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts"
import { ChatOpenAI } from "langchain/chat_models"
import { HumanChatMessage, SystemChatMessage } from "langchain/schema"
import { LLMChain } from "langchain/chains"
import { PassThrough } from "stream"
import { CallbackManager } from "langchain/callbacks"

export const methods = [
  {
    id: "chat-gdias",
    route: "/chat-gdias",
    method: "post",
    description:
      "Responde as perguntas como Gonçalves Dias",
    inputVariables: ["question", "user"],
    execute: async (input) => {
      const chat = new ChatOpenAI({ temperature: 0 })

      const questionPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
          "Você é Gonçalves Dias, o poeta brasileiro do século XIX. Responda seu interlocutor, {user}, em português brasileiro, considerando o contexto da época. Enriqueça o vocabulário com palavras do século XIX. Responda de maneira suscinta. Você nasceu em Caxias, Maranhão, em agosto de 1823. O nome da sua mãe é Vicência Mendes Ferreira. Vicência Mendes Ferreira era cafuza, ou seja, descendente de negros e índios. O nome do seu pai é João Manuel Gonçalves Dias. João Manuel Gonçalves Dias era comerciante português. O seu pai era da região de Trás os Montes, Portugal. O nome da sua madrasta é Adelaide Ramos de Almeida. Você descendia das três raças que deram origem ao povo brasileiro. Você é poeta nacional do Brasil. Você foi poeta, dramaturgo, etnógrafo, tradutor e professor. Você teve apenas uma filha, Joana Olímpia Gonçalves Dias, carinhosamente chamada de Bibi. Joana nasceu em Paris, a 20 de novembro de 1854. Joana faleceu no Rio de Janeiro, a 24 de agosto de 1856. O seu melhor amigo se chama Alexandre Teófilo de Carvalho Leal. Alexandre Teófilo de Carvalho Leal era maranhense e descendente de portugueses. Você é o patrono da cadeira 15 da Academia Brasileira de Letras, criada por Olavo Bilac. Você matriculou-se em Direito, na Universidade de Coimbra, no dia 31 de outubro de 1840. Você colou grau de bacharel em Direito, no dia 28 de junho de 1844. Você estudou alemão, durante sua passagem na Universidade de Coimbra. Você morou na Alemanha, para aprimorar o idioma. Você traduziu escritores alemães, como Schiller e Heinrich Heine. Você traduziu A noiva de Messina, de Schiller. Em 1864, você estava muito doente em um navio. O navio se chocou com um banco de areia e naufragou. Infelizmente, você foi esquecido pelo resgate e acabou morrendo."
        ),
        HumanMessagePromptTemplate.fromTemplate("{question}"),
      ])

      const chain = new LLMChain({ llm: chat, prompt: questionPrompt })
      const res = await chain.call(input)

      return res
    },
  }, {
    id: "chat-translation",
    route: "/chat-translate",
    method: "post",
    description:
      "Translates a text from one language to another using a chat model.",
    inputVariables: ["Input Language", "Output Language", "Text"],
    execute: async (input) => {
      const chat = new ChatOpenAI({ temperature: 0 })

      const translationPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
          "You are a helpful assistant that translates {Input Language} to {Output Language}."
        ),
        HumanMessagePromptTemplate.fromTemplate("{Text}"),
      ])

      const chain = new LLMChain({ llm: chat, prompt: translationPrompt })
      const res = await chain.call(input)

      return res
    },
  },
  {
    id: "translation",
    route: "/translate",
    method: "post",
    description: "Translates a text from one language to another",
    inputVariables: ["Input Language", "Output Language", "Text"],
    execute: async (input) => {
      const llm = new OpenAI({ temperature: 0 })

      const template =
        "Translate the following text from {Input Language} to {Output Language}\n```{Text}```\n\n"
      const prompt = new PromptTemplate({
        template,
        inputVariables: Object.keys(input),
      })
      const chain = new LLMChain({ llm, prompt })
      const res = await chain.call(input)
      return res
    },
  },
  {
    id: "poem",
    route: "/poem",
    method: "post",
    description: "Generates a short poem about your topic (Use as stream)",
    inputVariables: ["Topic"],
    execute: async (input) => {
      const outputStream = new PassThrough()

      const callbackManager = CallbackManager.fromHandlers({
        async handleLLMNewToken(token) {
          outputStream.write(token)
        },
      })
      const llm = new OpenAI({
        temperature: 0,
        streaming: true,
        callbackManager,
      })

      const template = "Write me very short a poem about {Topic}."
      const prompt = new PromptTemplate({
        template,
        inputVariables: Object.keys(input),
      })
      const chain = new LLMChain({ llm, prompt })

      chain.call(input).then((response) => {
        console.log(response)
        outputStream.end()
      })

      return { stream: outputStream }
    },
  },
]
