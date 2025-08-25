interface Author {
    id: number;
    firstName: string;
    lastName: string;
    headline: string;
    username: string;
    url: string;
  }
  
  export class LinkedInPost {
    constructor(
      public text: string,
      public totalReactionCount: number,
      public likeCount: number,
      public commentsCount: number,
      public repostsCount: number,
      public postUrl: string,
      public postedDate: string,
      public author: Author,
      public contentType: string
    ) {}
  }