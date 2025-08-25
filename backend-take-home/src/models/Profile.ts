interface Geo {
    country?: string;
    city?: string;
    full?: string;
    countryCode?: string;
  }
  
  interface EducationDates {
    year?: number;
    month?: number;
    day?: number;
  }
  
  interface EducationLogo {
    url?: string;
    width?: number;
    height?: number;
  }
  
  interface Education {
    start?: EducationDates;
    end?: EducationDates;
    fieldOfStudy?: string;
    degree?: string;
    grade?: string;
    schoolName?: string;
    description?: string;
    activities?: string;
    url?: string;
    schoolId?: string;
    logo?: EducationLogo[];
  }
  
  interface PositionDates {
    year?: number;
    month?: number;
    day?: number;
  }
  
  interface Position {
    companyId?: number;
    companyName?: string;
    title?: string;
    location?: string;
    description?: string;
    employmentType?: string;
    start?: PositionDates;
    end?: PositionDates;
  }
  
  interface Skill {
    name?: string;
    passedSkillAssessment?: boolean;
    endorsementsCount?: number;
  }
  
  // Main Profile Class
  export class LinkedInProfile {
    constructor(
      public id: number,
      public urn: string,
      public username: string,
      public firstName: string,
      public lastName: string,
      public isTopVoice: boolean,
      public isCreator: boolean,
      public isPremium: boolean,
      public profilePicture: string,
      public summary: string,
      public headline: string,
      public geo: Geo,
      public educations: Education[],
      public position: Position[],
      public skills: Skill[],
    ) {}
  
    public get currentPosition(): Position | undefined {
      // Logic to find the current position based on the absence of an 'end' date.
      // This is a common and useful helper method.
      return this.position.find(p => !p.end);
    }
  }