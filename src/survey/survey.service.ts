import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/config/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SurveyService {
  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // async createSurveyByAdmin(createSurveyDto: CreateSurveyDto) {
  //   const newSurvey = await this.prisma.form.create({
  //     data: {
  //       name: createSurveyDto.name,
  //       createdBy: createSurveyDto.createdBy,
  //       allowAnonymous: createSurveyDto.allowAnonymous ?? true,
  //       surveyOnQuestion: {
  //         create: createSurveyDto.surveyOnQuestions.map(
  //           (surveyOnQuestion, questionIndex) => ({
  //             sortOrder: surveyOnQuestion.sortOrder ?? questionIndex + 1,
  //             question: {
  //               create: {
  //                 headline: surveyOnQuestion.questions[0].headline,
  //                 required: surveyOnQuestion.questions[0].required,
  //                 questionType: surveyOnQuestion.questions[0].questionType,
  //                 answerOptions: {
  //                   create:
  //                     surveyOnQuestion.questions[0].answerOptions?.map(
  //                       (option) => ({
  //                         label: option.label,
  //                         value: option.value ?? null,
  //                         isActive: option.isActive ?? true,
  //                         sortOrder: option.sortOrder ?? 1,
  //                         isCorrect: option.isCorrect ?? false,
  //                         description: option.description ?? null,
  //                       }),
  //                     ) ?? [],
  //                 },
  //               },
  //             },
  //           }),
  //         ),
  //       },
  //       typeSurvey: {
  //         create: createSurveyDto.typeSurvey.map((type) => ({
  //           nameType: type,
  //         })),
  //       },
  //     },
  //     include: {
  //       surveyOnQuestion: {
  //         include: {
  //           question: {
  //             include: {
  //               answerOptions: true,
  //             },
  //           },
  //         },
  //       },
  //       typeSurvey: true,
  //     },
  //   });

  //   // Tạo các cài đặt mặc định từ file surveySettingsDefaults
  //   const settingTypePromises = surveySettingDefaults.map(
  //     async (defaultType) => {
  //       let settingType = await this.prisma.settingTypes.findUnique({
  //         where: { name: defaultType.name },
  //       });

  //       if (!settingType) {
  //         settingType = await this.prisma.settingTypes.create({
  //           data: {
  //             name: defaultType.name,
  //             description: defaultType.description,
  //             defaultValue: defaultType.defaultValue,
  //           },
  //         });
  //       }

  //       // Tạo các cài đặt tương ứng từ danh sách settings
  //       await Promise.all(
  //         defaultType.settings.map((setting) =>
  //           this.prisma.surveySettings.create({
  //             data: {
  //               surveyId: newSurvey.id,
  //               key: setting.key,
  //               value: setting.value,
  //               surveySettingTypesId: settingType.id,
  //             },
  //           }),
  //         ),
  //       );
  //     },
  //   );

  //   // Chờ các cài đặt được lưu vào cơ sở dữ liệu
  //   await Promise.all(settingTypePromises);

  //   return newSurvey;
  // }

  // async createSurveyByBusiness(
  //   createSurveyDto: CreateSurveyDto,
  //   businessId: number,
  // ) {
  //   // Kiểm tra sự tồn tại của Business
  //   const business = await this.prisma.business.findUnique({
  //     where: { id: businessId },
  //   });
  //   if (!business) {
  //     throw new BadRequestException('Business ID không tồn tại');
  //   }

  //   // Tạo Survey mới
  //   const newSurvey = await this.prisma.survey.create({
  //     data: {
  //       name: createSurveyDto.name,
  //       description: createSurveyDto.description,
  //       createdBy: createSurveyDto.createdBy,
  //       allowAnonymous: createSurveyDto.allowAnonymous ?? true,
  //       isTemplate: createSurveyDto.isTemplate ?? false,
  //       typeSurvey: {
  //         create: createSurveyDto.typeSurvey.map((type) => ({
  //           nameType: type,
  //         })),
  //       },
  //     },
  //     include: {
  //       typeSurvey: true,
  //     },
  //   });

  //   await this.prisma.businessSurvey.create({
  //     data: {
  //       businessId,
  //       surveyId: newSurvey.id,
  //     },
  //   });

  //   // Lưu các cài đặt mặc định từ file `surveySettingDefaults`
  //   const settingTypePromises = surveySettingDefaults.map(
  //     async (defaultSetting) => {
  //       // Tìm hoặc tạo mới SurveySettingType
  //       let settingType = await this.prisma.settingTypes.findUnique({
  //         where: { name: defaultSetting.name },
  //       });

  //       if (!settingType) {
  //         settingType = await this.prisma.settingTypes.create({
  //           data: {
  //             name: defaultSetting.name,
  //             description: defaultSetting.description,
  //             defaultValue: defaultSetting.defaultValue,
  //           },
  //         });
  //       }

  //       // Tạo các cài đặt (SurveySettings) cho Survey
  //       await Promise.all(
  //         defaultSetting.settings.map((setting) =>
  //           this.prisma.surveySettings.create({
  //             data: {
  //               surveyId: newSurvey.id,
  //               key: setting.key,
  //               value: setting.value,
  //               surveySettingTypesId: settingType.id,
  //             },
  //           }),
  //         ),
  //       );
  //     },
  //   );

  //   await Promise.all(settingTypePromises);

  //   return newSurvey;
  // }

  // async getSurveyById(surveyId: number, businessId?: number) {
  //   // Lấy thông tin survey
  //   const survey = await this.prisma.survey.findUnique({
  //     where: {
  //       id: surveyId,
  //     },
  //     include: {
  //       businesses: businessId
  //         ? {
  //             where: {
  //               id: businessId,
  //             },
  //           }
  //         : true,
  //     },
  //   });

  //   if (!survey) {
  //     throw new BadRequestException('Survey không tồn tại');
  //   }

  //   if (
  //     businessId &&
  //     !survey.businesses.some((business) => business.id === businessId)
  //   ) {
  //     throw new BadRequestException('Survey không thuộc về doanh nghiệp này');
  //   }

  //   // Truy vấn surveyOnQuestion với sắp xếp
  //   const surveyOnQuestions = await this.prisma.surveyOnQuestion.findMany({
  //     where: {
  //       surveyId,
  //     },
  //     include: {
  //       question: {
  //         include: {
  //           answerOptions: true,
  //           ratingConfiguration: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       sortOrder: 'asc',
  //     },
  //   });

  //   return {
  //     ...survey,
  //     surveyOnQuestion: surveyOnQuestions,
  //   };
  // }

  // // async updateBusinessSurveySetting(
  // //   surveyId: number,
  // //   businessId: number,
  // //   key: string,
  // //   value: Json,
  // // ) {
  // //   // Kiểm tra xem cài đặt đã tồn tại chưa
  // //   const existingSetting = await this.prisma.businessSurveySettings.findUnique(
  // //     {
  // //       where: {
  // //         businessId_surveyId_key: {
  // //           businessId: businessId,
  // //           surveyId: surveyId,
  // //           key: key,
  // //         },
  // //       },
  // //     },
  // //   );

  // //   if (existingSetting) {
  // //     // Nếu cài đặt đã tồn tại, cập nhật giá trị
  // //     return await this.prisma.businessSurveySettings.update({
  // //       where: {
  // //         id: existingSetting.id,
  // //       },
  // //       data: {
  // //         value: value,
  // //       },
  // //     });
  // //   } else {
  // //     // Nếu cài đặt chưa tồn tại, tạo mới
  // //     return await this.prisma.businessSurveySettings.create({
  // //       data: {
  // //         businessId: businessId,
  // //         surveyId: surveyId,
  // //         key: key,
  // //         value: value,
  // //       },
  // //     });
  // //   }
  // // }

  // async updateSurveySettings(
  //   surveyId: number,
  //   businessId: number | null,
  //   settings: { key: string; value: any }[],
  // ) {
  //   if (!Array.isArray(settings) || settings.length === 0) {
  //     throw new BadRequestException('Settings must be a non-empty array');
  //   }

  //   const updatePromises = settings.map((setting) => {
  //     return this.prisma.businessSurveySettings.upsert({
  //       where: {
  //         businessId_surveyId_key: {
  //           businessId: businessId,
  //           surveyId: surveyId,
  //           key: setting.key,
  //         },
  //       },
  //       update: {
  //         value: setting.value,
  //       },
  //       create: {
  //         businessId: businessId,
  //         surveyId: surveyId,
  //         key: setting.key,
  //         value: setting.value,
  //       },
  //     });
  //   });

  //   await Promise.all(updatePromises);

  //   const defaultSettings = await this.prisma.surveySettings.findMany({
  //     where: { surveyId },
  //   });

  //   const createBusinessSettingsPromises = defaultSettings.map(
  //     (defaultSetting) =>
  //       this.prisma.businessSurveySettings.upsert({
  //         where: {
  //           businessId_surveyId_key: {
  //             businessId: businessId,
  //             surveyId: surveyId,
  //             key: defaultSetting.key,
  //           },
  //         },
  //         update: {
  //           value: defaultSetting.value,
  //         },
  //         create: {
  //           businessId: businessId,
  //           surveyId: surveyId,
  //           key: defaultSetting.key,
  //           value: defaultSetting.value,
  //         },
  //       }),
  //   );

  //   await Promise.all(createBusinessSettingsPromises);
  // }

  // async getBusinessSurveySettings(surveyId: number, businessId: number) {
  //   const businessSurveySettings =
  //     await this.prisma.businessSurveySettings.findMany({
  //       where: {
  //         surveyId: surveyId,
  //         businessId: businessId,
  //       },
  //     });

  //   if (!businessSurveySettings || businessSurveySettings.length === 0) {
  //     const defaultSurveySettings = await this.prisma.surveySettings.findMany({
  //       where: {
  //         surveyId: surveyId,
  //       },
  //     });
  //     return defaultSurveySettings;
  //   }

  //   return businessSurveySettings;
  // }

  // async getAllSurvey(businessId: number) {
  //   const business = await this.prisma.business.findUnique({
  //     where: { id: businessId },
  //   });
  //   if (!business) {
  //     throw new BadRequestException('Business ID không tồn tại');
  //   }

  //   const surveys = await this.prisma.businessSurvey.findMany({
  //     where: {
  //       businessId: businessId,
  //     },
  //     include: {
  //       survey: true,
  //     },
  //   });

  //   return surveys.map((businessSurvey) => businessSurvey.survey);
  // }

  // async getAllSurveyTemplate() {
  //   const surveys = await this.prisma.survey.findMany({
  //     where: {
  //       isTemplate: true,
  //     },
  //   });

  //   return surveys;
  // }

  // async updateSurveyallowAnonymous(surveyId: number, active: boolean) {
  //   const survey = await this.prisma.survey.findUnique({
  //     where: {
  //       id: surveyId,
  //     },
  //   });
  //   if (!survey) {
  //     throw new BadRequestException('survey id not existing');
  //   }
  //   return await this.prisma.survey.update({
  //     where: {
  //       id: surveyId,
  //     },
  //     data: {
  //       allowAnonymous: active,
  //     },
  //   });
  // }

  // async updateSurveyStatus(surveyId: number, status: SurveyStatus) {
  //   const survey = await this.prisma.survey.findUnique({
  //     where: {
  //       id: surveyId,
  //     },
  //   });
  //   if (!survey) {
  //     throw new BadRequestException('survey id not existing');
  //   }
  //   return await this.prisma.survey.update({
  //     where: {
  //       id: surveyId,
  //     },
  //     data: {
  //       status: status,
  //     },
  //   });
  // }

  // async updateSurvey(surveyId: number, status: SurveyStatus) {
  //   const survey = await this.prisma.survey.findUnique({
  //     where: {
  //       id: surveyId,
  //     },
  //   });
  //   if (!survey) {
  //     throw new BadRequestException('survey id not existing');
  //   }
  //   return await this.prisma.survey.update({
  //     where: {
  //       id: surveyId,
  //     },
  //     data: {
  //       status: status,
  //     },
  //   });
  // }

  // async selectedSurvey(surveyId: number, businessId: number) {
  //   const business = await this.prisma.business.findUnique({
  //     where: { id: businessId },
  //   });
  //   if (!business) {
  //     throw new BadRequestException('Business ID không tồn tại');
  //   }

  //   const survey = await this.prisma.survey.findUnique({
  //     where: { id: surveyId },
  //   });
  //   if (!survey) {
  //     throw new BadRequestException('Survey ID không tồn tại');
  //   }

  //   if (!survey.isTemplate) {
  //     throw new BadRequestException('Survey is not template');
  //   }

  //   const existingBusinessSurvey = await this.prisma.businessSurvey.findFirst({
  //     where: {
  //       businessId,
  //       surveyId,
  //     },
  //   });

  //   if (existingBusinessSurvey) {
  //     throw new BadRequestException('Survey này đã được gán cho Business');
  //   }

  //   const businessSurvey = await this.prisma.businessSurvey.create({
  //     data: {
  //       businessId,
  //       surveyId,
  //     },
  //     include: {
  //       business: true,
  //       survey: true,
  //     },
  //   });

  //   return businessSurvey;
  // }

  // async updateSurvey(surveyId: number, dto: UpdateSurveyDto) {
  //   const { name, questions } = dto;

  //   try {
  //     const updatedSurvey = await this.prisma.$transaction(async (prisma) => {
  //       const survey = await prisma.survey.update({
  //         where: { id: surveyId },
  //         data: {
  //           name,
  //           updatedAt: new Date(),
  //         },
  //       });

  //       if (questions) {
  //         const existingQuestions = await prisma.question.findMany({
  //           where: { surveyId },
  //         });

  //         const updatedQuestionIds = [];
  //         for (const questionData of questions) {
  //           const { id, headline, questionType, required, answerOptions } =
  //             questionData;

  //           let updatedQuestion;
  //           if (id) {
  //             updatedQuestion = await prisma.question.update({
  //               where: { id },
  //               data: {
  //                 headline,
  //                 questionType,
  //                 required,
  //               },
  //             });
  //             updatedQuestionIds.push(id);
  //           } else {
  //             updatedQuestion = await prisma.question.create({
  //               data: {
  //                 headline,
  //                 questionType,
  //                 required,
  //                 surveyId,
  //               },
  //             });
  //             updatedQuestionIds.push(updatedQuestion.id);
  //           }

  //           if (answerOptions) {
  //             const existingAnswerOptions = await prisma.answerOption.findMany({
  //               where: { questionId: updatedQuestion.id },
  //             });

  //             const updatedAnswerOptionIds = [];
  //             for (const answerOptionData of answerOptions) {
  //               const { id: answerOptionId, label } = answerOptionData;

  //               if (answerOptionId) {
  //                 await prisma.answerOption.update({
  //                   where: { id: answerOptionId },
  //                   data: { label },
  //                 });
  //                 updatedAnswerOptionIds.push(answerOptionId);
  //               } else {
  //                 const newAnswerOption = await prisma.answerOption.create({
  //                   data: {
  //                     questionId: updatedQuestion.id,
  //                     label,
  //                   },
  //                 });
  //                 updatedAnswerOptionIds.push(newAnswerOption.id);
  //               }
  //             }

  //             const answerOptionIdsToDelete = existingAnswerOptions
  //               .filter((opt) => !updatedAnswerOptionIds.includes(opt.id))
  //               .map((opt) => opt.id);

  //             if (answerOptionIdsToDelete.length) {
  //               await prisma.answerOption.deleteMany({
  //                 where: {
  //                   id: { in: answerOptionIdsToDelete },
  //                 },
  //               });
  //             }
  //           }
  //         }

  //         const questionIdsInDto = questions.map((q) => q.id);
  //         const questionIdsToDelete = existingQuestions
  //           .filter((question) => !questionIdsInDto.includes(question.id))
  //           .map((question) => question.id);

  //         if (questionIdsToDelete.length) {
  //           await prisma.question.deleteMany({
  //             where: {
  //               id: { in: questionIdsToDelete },
  //             },
  //           });
  //         }
  //       }

  //       return survey;
  //     });
  //     console.log('Survey updated successfully:', updatedSurvey);
  //     return updatedSurvey;
  //   } catch (error) {
  //     console.error('Error updating survey:', error.message);
  //     throw new Error('Failed to update survey. Please check your data.');
  //   }
  // }

  // async deleteSurvey(surveyId: number) {
  //   return await this.prisma.survey.delete({
  //     where: {
  //       id: surveyId,
  //     },
  //   });
  // }

  // async calculateAnswerStatisticsBySurveyId(surveyId: number): Promise<any[]> {
  //   const survey = await this.prisma.survey.findUnique({
  //     where: { id: surveyId },
  //     include: {
  //       questions: {
  //         include: {
  //           answerOptions: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!survey) {
  //     throw new Error(`Survey with id ${surveyId} not found.`);
  //   }

  //   const responses = await this.prisma.response.findMany({
  //     where: { surveyId },
  //   });

  //   return survey.questions.map((question: any) => {
  //     const answerOptions = question.answerOptions;
  //     const answerCounts = answerOptions.map((option: any) => {
  //       const count = responses.filter(
  //         (response) => response.answerOptionId === option.id,
  //       ).length;
  //       return {
  //         label: option.label,
  //         count,
  //       };
  //     });

  //     const totalResponses = answerCounts.reduce(
  //       (sum, option) => sum + option.count,
  //       0,
  //     );

  //     const freeTextResponses = responses
  //       .filter(
  //         (response) =>
  //           response.questionId === question.id &&
  //           !response.answerOptionId &&
  //           response.freeText,
  //       )
  //       .map((response) => response.freeText);

  //     const percentages = answerCounts.map((option) => ({
  //       label: option.label,
  //       count: option.count,
  //       percentage: totalResponses
  //         ? parseFloat(((option.count / totalResponses) * 100).toFixed(2))
  //         : 0,
  //     }));

  //     return {
  //       question: question.headline,
  //       totalResponses,
  //       answerStatistics: percentages,
  //       freeTextResponses,
  //     };
  //   });
  // }
  // async setQuestionType(
  //   type: QuestionType,
  //   questionId: number,
  //   surveyId: number,
  // ) {
  //   const survey = await this.prisma.survey.findUnique({
  //     where: {
  //       id: surveyId,
  //     },
  //   });
  //   if (!survey) {
  //     throw new BadRequestException('survey id not existing');
  //   }

  //   const question = await this.prisma.surveyOnQuestion.findUnique({
  //     where: {
  //       id: surveyId,
  //     },
  //   });

  //   return this.prisma.SurveyOnQuestion.update({
  //     where: {
  //       surveyId: survey.id,
  //       id: questionId,
  //     },
  //     data: {
  //       questionType: type,
  //     },
  //   });
  // }
}
