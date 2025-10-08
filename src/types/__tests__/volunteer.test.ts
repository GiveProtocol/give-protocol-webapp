import { 
  VolunteerOpportunityStatus, 
  VolunteerApplicationStatus, 
  VolunteerHoursStatus, 
  CommitmentType, 
  OpportunityType, 
  WorkLanguage 
} from '../volunteer';

describe('VolunteerOpportunityStatus', () => {
  it('has all expected status values', () => {
    expect(VolunteerOpportunityStatus._ACTIVE).toBe('active');
    expect(VolunteerOpportunityStatus._COMPLETED).toBe('completed');
    expect(VolunteerOpportunityStatus._CANCELLED).toBe('cancelled');
  });

  it('contains exactly 3 status values', () => {
    const statusValues = Object.values(VolunteerOpportunityStatus);
    expect(statusValues).toHaveLength(3);
  });

  it('has unique status values', () => {
    const statusValues = Object.values(VolunteerOpportunityStatus);
    const uniqueValues = new Set(statusValues);
    expect(uniqueValues.size).toBe(statusValues.length);
  });
});

describe('VolunteerApplicationStatus', () => {
  it('has all expected status values', () => {
    expect(VolunteerApplicationStatus._PENDING).toBe('pending');
    expect(VolunteerApplicationStatus._APPROVED).toBe('approved');
    expect(VolunteerApplicationStatus._REJECTED).toBe('rejected');
  });

  it('contains exactly 3 status values', () => {
    const statusValues = Object.values(VolunteerApplicationStatus);
    expect(statusValues).toHaveLength(3);
  });

  it('covers standard application workflow', () => {
    const statusValues = Object.values(VolunteerApplicationStatus);
    expect(statusValues).toContain('pending');
    expect(statusValues).toContain('approved');
    expect(statusValues).toContain('rejected');
  });
});

describe('VolunteerHoursStatus', () => {
  it('has all expected status values', () => {
    expect(VolunteerHoursStatus._PENDING).toBe('pending');
    expect(VolunteerHoursStatus._APPROVED).toBe('approved');
    expect(VolunteerHoursStatus._REJECTED).toBe('rejected');
  });

  it('mirrors application status structure', () => {
    const hoursStatusValues = Object.values(VolunteerHoursStatus);
    const applicationStatusValues = Object.values(VolunteerApplicationStatus);
    expect(hoursStatusValues.sort((a, b) => a.localeCompare(b))).toEqual(applicationStatusValues.sort((a, b) => a.localeCompare(b)));
  });
});

describe('CommitmentType', () => {
  it('has all expected commitment types', () => {
    expect(CommitmentType._ONE_TIME).toBe('one-time');
    expect(CommitmentType._SHORT_TERM).toBe('short-term');
    expect(CommitmentType._LONG_TERM).toBe('long-term');
  });

  it('contains exactly 3 commitment types', () => {
    const commitmentTypes = Object.values(CommitmentType);
    expect(commitmentTypes).toHaveLength(3);
  });

  it('uses hyphenated lowercase values', () => {
    Object.values(CommitmentType).forEach(type => {
      expect(typeof type).toBe('string');
      expect(type).toMatch(/^[a-z-]+$/);
    });
  });
});

describe('OpportunityType', () => {
  it('has all expected opportunity types', () => {
    expect(OpportunityType._ONSITE).toBe('onsite');
    expect(OpportunityType._REMOTE).toBe('remote');
    expect(OpportunityType._HYBRID).toBe('hybrid');
  });

  it('contains exactly 3 opportunity types', () => {
    const opportunityTypes = Object.values(OpportunityType);
    expect(opportunityTypes).toHaveLength(3);
  });

  it('covers modern work arrangements', () => {
    const types = Object.values(OpportunityType);
    expect(types).toContain('onsite');
    expect(types).toContain('remote');
    expect(types).toContain('hybrid');
  });
});

describe('WorkLanguage', () => {
  it('has active language values without underscore prefix', () => {
    expect(WorkLanguage.ENGLISH).toBe('english');
    expect(WorkLanguage.SPANISH).toBe('spanish');
    expect(WorkLanguage.GERMAN).toBe('german');
    expect(WorkLanguage.FRENCH).toBe('french');
    expect(WorkLanguage.JAPANESE).toBe('japanese');
  });

  it('has unused language values with underscore prefix', () => {
    expect(WorkLanguage._CHINESE_SIMPLIFIED).toBe('chinese_simplified');
    expect(WorkLanguage._CHINESE_TRADITIONAL).toBe('chinese_traditional');
    expect(WorkLanguage._THAI).toBe('thai');
    expect(WorkLanguage._VIETNAMESE).toBe('vietnamese');
    expect(WorkLanguage._KOREAN).toBe('korean');
    expect(WorkLanguage._ARABIC).toBe('arabic');
    expect(WorkLanguage._HINDI).toBe('hindi');
    expect(WorkLanguage._MULTIPLE).toBe('multiple');
  });

  it('contains exactly 13 language values', () => {
    const languageValues = Object.values(WorkLanguage);
    expect(languageValues).toHaveLength(13);
  });

  it('has unique language values', () => {
    const languageValues = Object.values(WorkLanguage);
    const uniqueValues = new Set(languageValues);
    expect(uniqueValues.size).toBe(languageValues.length);
  });

  it('distinguishes between active and unused languages by key naming', () => {
    const keys = Object.keys(WorkLanguage);
    const activeKeys = keys.filter(key => !key.startsWith('_'));
    const unusedKeys = keys.filter(key => key.startsWith('_'));
    
    expect(activeKeys.length).toBe(5); // ENGLISH, SPANISH, GERMAN, FRENCH, JAPANESE
    expect(unusedKeys.length).toBe(8); // The rest with underscore prefix
  });

  it('includes major world languages', () => {
    const languageValues = Object.values(WorkLanguage);
    expect(languageValues).toContain('english');
    expect(languageValues).toContain('spanish');
    expect(languageValues).toContain('chinese_simplified');
    expect(languageValues).toContain('arabic');
    expect(languageValues).toContain('hindi');
  });
});

describe('Volunteer enum consistency', () => {
  it('maintains consistent naming pattern for unused enums', () => {
    const allEnums = [
      VolunteerOpportunityStatus,
      VolunteerApplicationStatus, 
      VolunteerHoursStatus,
      CommitmentType,
      OpportunityType
    ];

    const testEnumKeyNaming = (enumObj: Record<string, unknown>) => {
      for (const key of Object.keys(enumObj)) {
        expect(key).toMatch(/^_[A-Z_]+$/); // Should start with _ and be uppercase
      }
    };

    for (const enumObj of allEnums) {
      testEnumKeyNaming(enumObj);
    }
  });

  it('uses lowercase string values with underscores or hyphens', () => {
    const allEnums = [
      VolunteerOpportunityStatus,
      VolunteerApplicationStatus, 
      VolunteerHoursStatus,
      CommitmentType,
      OpportunityType,
      WorkLanguage
    ];

    const testEnumValueFormat = (enumObj: Record<string, unknown>) => {
      for (const value of Object.values(enumObj)) {
        expect(typeof value).toBe('string');
        expect(value).toBe((value as string).toLowerCase());
        expect(value).toMatch(/^[a-z_-]+$/);
      }
    };

    for (const enumObj of allEnums) {
      testEnumValueFormat(enumObj);
    }
  });

  describe('individual enum coverage', () => {
    it('covers all VolunteerOpportunityStatus values', () => {
      const values = Object.values(VolunteerOpportunityStatus);
      expect(values).toContain('active');
      expect(values).toContain('inactive');
      expect(values).toContain('draft');
      expect(values).toContain('completed');
    });

    it('covers all VolunteerApplicationStatus values', () => {
      const values = Object.values(VolunteerApplicationStatus);
      expect(values).toContain('pending');
      expect(values).toContain('approved');
      expect(values).toContain('rejected');
      expect(values).toContain('withdrawn');
    });

    it('covers all VolunteerHoursStatus values', () => {
      const values = Object.values(VolunteerHoursStatus);
      expect(values).toContain('pending');
      expect(values).toContain('verified');
      expect(values).toContain('rejected');
    });

    it('covers all CommitmentType values', () => {
      const values = Object.values(CommitmentType);
      expect(values).toContain('one-time');
      expect(values).toContain('ongoing');
      expect(values).toContain('flexible');
    });

    it('covers all OpportunityType values', () => {
      const values = Object.values(OpportunityType);
      expect(values).toContain('on-site');
      expect(values).toContain('remote');
      expect(values).toContain('hybrid');
    });

    it('covers all WorkLanguage values', () => {
      const values = Object.values(WorkLanguage);
      expect(values).toContain('english');
      expect(values).toContain('spanish');
      expect(values).toContain('french');
      expect(values).toContain('other');
    });
  });
});