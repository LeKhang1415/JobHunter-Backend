export class SubscriberSkillResponseDto {
  id: string;
  name: string;
}

export class SubscriberResponseDto {
  id: string;
  email: string;
  skills: SubscriberSkillResponseDto[];
}
