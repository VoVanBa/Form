import { AddAnswerOptionDto } from "src/question/dtos/add.answer.option.dto";


export interface AnswerOptionRepository {
    createAnswerOptions(questionId:number,answerOptions:AddAnswerOptionDto,index:number)
    getQuantityAnserOptionbyQuestionId(questionId:number)

}