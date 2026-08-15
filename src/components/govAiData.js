// Simplified Government AI Assistant Data & Response Generator

export const STARTER_PROMPTS = [
  {
    id: 'p1',
    title: 'Start a Food & Beverage Business',
    description: 'Identify step-by-step applications across SSM, Local Council, KKM, JAKIM & LHDN.',
    category: 'Business & Food',
    icon: 'briefcase',
    sampleQuery: 'I want to start a food business. What applications do I need to do and which agencies are involved?',
  },
  {
    id: 'p2',
    title: 'Renew Driving Licence & Road Tax',
    description: 'Check renewal fees, 10-year discount, and instant MyJPJ digital licence steps.',
    category: 'Transport & JPJ',
    icon: 'car',
    sampleQuery: 'How can I renew my Malaysian driving licence online?',
  },
  {
    id: 'p3',
    title: 'STR Cash Assistance & SARA Aid',
    description: 'Check payment dates, household eligibility tiers, and how to receive aid.',
    category: 'Welfare & Aid',
    icon: 'wallet',
    sampleQuery: 'How do I check my STR cash assistance payment status?',
  },
  {
    id: 'p4',
    title: 'Register a New Business (SSM)',
    description: 'Simple steps to register a sole proprietorship or enterprise on EzBiz.',
    category: 'Business & SSM',
    icon: 'briefcase',
    sampleQuery: 'What are the steps to register a new business with SSM EzBiz?',
  },
  {
    id: 'p5',
    title: 'MyKad Replacement & Walk-in',
    description: 'Fix unreadable IC chip at UTC within 45 minutes and fee details.',
    category: 'Identity (JPN)',
    icon: 'badge-check',
    sampleQuery: 'My MyKad chip is broken. Where can I get a replacement and what is the fee?',
  },
  {
    id: 'p6',
    title: 'PTPTN Higher Education Loan',
    description: 'Check loan eligibility tiers, accredited IPT courses, and SSPN requirements.',
    category: 'Education & Loan',
    icon: 'file-text',
    sampleQuery: 'How to apply PTPTN loan and what are the eligibility requirements?',
  },
  {
    id: 'p7',
    title: 'Personal Tax Reliefs & e-Filing',
    description: 'Simple list of tax deductions for medical, lifestyle, EPF, and family.',
    category: 'Taxation (LHDN)',
    icon: 'file-text',
    sampleQuery: 'What tax reliefs can I claim for this year in e-Filing?',
  },
];

// Generates intelligent, simple, citizen-friendly AI responses
export function generateGovAiResponse(userQuery) {
  const query = userQuery.toLowerCase();

  // 1. Driving Licence / JPJ / Road Tax
  if (query.includes('licen') || query.includes('lesen') || query.includes('jpj') || query.includes('road tax') || query.includes('driving')) {
    return {
      agency: 'JPJ (Road Transport Department)',
      content: `You can renew your **Malaysian Driving Licence (CDL)** easily online without queueing at the counter.

### How to Renew:
1. Open the **MyJPJ App** or visit the **MySikap Portal**.
2. Go to **Driver Profile > Licence Renewal**.
3. Choose your renewal period (**1 to 10 years**).
4. Pay online via FPX, Debit, or Credit Card.
5. Your digital driving licence will appear immediately in your MyJPJ app!

### Fees & Discounts:
- **Annual Fee**: **RM30 per year** (Class D/DA cars).
- **10-Year Discount**: Renew for 10 years for only **RM270** (get 1 year free).
- **Physical Card**: Digital licence is valid everywhere. If you prefer a physical card, you can get one printed at any UTC branch for RM20.`,
      actionCards: [
        {
          id: 'act-myjpj',
          title: 'Open MyJPJ Portal',
          subtitle: 'Direct renewal link on official JPJ website',
          type: 'link',
          url: 'https://public.jpj.gov.my',
          btnText: 'Open MyJPJ',
          icon: 'external',
        },
      ],
      suggestions: [
        'What if my licence has been expired for over 3 years?',
        'How do I renew my road tax digitally?',
        'Can I renew my motorcycle licence at the same time?',
      ],
    };
  }

  // 2. STR / Subsidies / Cash Aid / Welfare
  if (query.includes('str') || query.includes('bantuan') || query.includes('aid') || query.includes('subsidy') || query.includes('budi') || query.includes('sara') || query.includes('welfare')) {
    return {
      agency: 'Ministry of Finance (MOF) / LHDN',
      content: `Here is the current information on **Sumbangan Tunai Rahmah (STR)** cash assistance:

### Payment Schedule & Amounts:
- **Payment Distribution**: Payments are credited directly into your registered bank account in 4 phases throughout the year.
- **Households (Income < RM2,500/month)**: Up to **RM2,500** per year depending on the number of children.
- **Households (Income RM2,501 - RM5,000/month)**: Up to **RM1,250** per year.
- **Single Citizens (Age 21-59, Income < RM2,500)**: **RM350** per year.
- **Senior Citizens (Age 60+, without spouse)**: **RM600** per year.

### How to Check Your Status:
1. Visit the official STR portal at **[bantuantunai.hasil.gov.my](https://bantuantunai.hasil.gov.my)**.
2. Enter your MyKad number to log in.
3. Check your approval status and verified bank account number.`,
      actionCards: [
        {
          id: 'act-str-check',
          title: 'Check STR Status',
          subtitle: 'Official LHDN Sumbangan Tunai Rahmah Portal',
          type: 'link',
          url: 'https://bantuantunai.hasil.gov.my',
          btnText: 'Check STR Status',
          icon: 'external',
        },
      ],
      suggestions: [
        'How do I appeal if my application was rejected?',
        'How do I update my bank account details for STR?',
        'What is SARA monthly grocery aid?',
      ],
    };
  }

  // 3. Food Business / Restaurant / Cafe / F&B Setup
  if (query.includes('food') || query.includes('makanan') || query.includes('restaurant') || query.includes('restoran') || query.includes('cafe') || query.includes('f&b') || (query.includes('start') && query.includes('business'))) {
    return {
      agency: 'SSM, Local Council (PBT), KKM, JAKIM, LHDN, KWSP & PERKESO',
      content: `Starting a **Food & Beverage (F&B) business** in Malaysia requires completing several sequential applications across specific government agencies:

## Step 1: Business Registration (SSM)
- **Application**: Register Sole Proprietorship (Enterprise) or Sdn Bhd.
- **Agency**: **Suruhanjaya Syarikat Malaysia (SSM)**
- **Official Portal**: **[SSM EzBiz](https://ezbiz.ssm.com.my)**
- **Fee**: RM30/year (Personal Name) or RM60/year (Trade Name).
- **Timeframe**: Approved within 24 hours.

## Step 2: Food Handler Training & Typhoid Inoculation (KKM)
- **Application**: 
  1. Mandatory 3-hour **Food Handler Training (Kursus Latihan Pengendali Makanan - SLPM)**. (~RM50/person)
  2. Mandatory **Typhoid Vaccination (Suntikan Tifoid TY2)** for all staff. (~RM60-RM100/person, valid for 3 years)
- **Agency**: **Ministry of Health (KKM) / Food Safety and Quality Division (BKKM)**
- **Portal**: **[FoSIM KKM](https://fosim.moh.gov.my)**

## Step 3: Business Premise & Signboard License (Local Council / PBT)
- **Application**: Apply for **Premise License (Lesen Premis)** and **Signboard License (Lesen Papan Iklan)**.
- **Agency**: Your respective **Local Council / PBT** (e.g. DBKL, MBPJ, MBSA, MBJB, MPKJ, etc.).
- **Requirements**: Premise tenancy agreement, layout plan, BOMBA fire safety support letter, grease trap installation, DBP Malay language verification.

## Step 4: Halal Certification (JAKIM / JAIN) - Recommended
- **Application**: Apply for Malaysian Halal Certification.
- **Agency**: **Department of Islamic Development Malaysia (JAKIM)** / State Religious Dept (JAIN).
- **Official Portal**: **[MYeHALAL](https://myehalal.halal.gov.my)**
- **Requirements**: Minimum 2 Muslim food handlers, 100% Halal certified ingredients.

## Step 5: Tax Registration (LHDN)
- **Application**: Register for Income Tax File & National e-Invoicing.
- **Agency**: **Lembaga Hasil Dalam Negeri (LHDN)**
- **Official Portal**: **[MyTax](https://mytax.hasil.gov.my)**

## Step 6: Employer Statutory Contributions (If hiring employees)
- **Agencies**: **KWSP / EPF** (i-Akaun Majikan) & **PERKESO / SOCSO** (ASSIST Portal).`,
      actionCards: [
        {
          id: 'act-ssm-ezbiz',
          title: 'SSM EzBiz Portal',
          subtitle: 'Register your food business online',
          type: 'link',
          url: 'https://ezbiz.ssm.com.my',
          btnText: 'Open EzBiz',
          icon: 'external',
        },
        {
          id: 'act-fosim',
          title: 'KKM FoSIM Portal',
          subtitle: 'Food safety & handler guidelines',
          type: 'link',
          url: 'https://fosim.moh.gov.my',
          btnText: 'Open FoSIM',
          icon: 'external',
        },
        {
          id: 'act-myehalal',
          title: 'JAKIM MYeHALAL',
          subtitle: 'Apply for Halal certification',
          type: 'link',
          url: 'https://myehalal.halal.gov.my',
          btnText: 'Open MYeHALAL',
          icon: 'external',
        },
        {
          id: 'act-mytax',
          title: 'LHDN MyTax',
          subtitle: 'Tax registration for new businesses',
          type: 'link',
          url: 'https://mytax.hasil.gov.my',
          btnText: 'Open MyTax',
          icon: 'external',
        },
      ],
      suggestions: [
        'Do home-based food sellers need a PBT premise license?',
        'How much is the Typhoid vaccine at clinics?',
        'What are the requirements for JAKIM Halal certification?',
        'Should I register as Sole Proprietor or Sdn Bhd for a cafe?',
      ],
    };
  }

  // 4. SSM / General Business / Company / License
  if (query.includes('ssm') || query.includes('business') || query.includes('perniagaan') || query.includes('ezbiz') || query.includes('company') || query.includes('sdn bhd')) {
    return {
      agency: 'Companies Commission of Malaysia (SSM)',
      content: `Registering a **Sole Proprietorship (Enterprise / Perniagaan)** can be completed 100% online through **SSM EzBiz**.

### Requirements:
- Malaysian Citizen or Permanent Resident, aged 18 and above.
- An activated EzBiz online account.

### Costs:
- **Personal Name** (e.g., *Jason Tan*): **RM30 / year**
- **Trade Name** (e.g., *Jason Creative Studio*): **RM60 / year**
- **Branch**: RM5 per branch / year

### 3 Simple Steps:
1. Log in to [ezbiz.ssm.com.my](https://ezbiz.ssm.com.my).
2. Go to **My Business Services > New Business Registration (Form A)**.
3. Fill in your business details, pay online via FPX, and your certificate (Borang E) is usually approved within 24 hours.`,
      actionCards: [
        {
          id: 'act-ssm-ezbiz',
          title: 'Open SSM EzBiz',
          subtitle: 'Register your business online now',
          type: 'link',
          url: 'https://ezbiz.ssm.com.my',
          btnText: 'Open SSM EzBiz',
          icon: 'external',
        },
      ],
      suggestions: [
        'Do I need a premise license from local council (PBT)?',
        'How do I open a business bank account with Borang E?',
        'How to renew an existing SSM business?',
      ],
    };
  }

  // 4. JPN / MyKad / Passport / Identity
  if (query.includes('jpn') || query.includes('mykad') || query.includes('ic') || query.includes('passport') || query.includes('kad pengenalan') || query.includes('birth') || query.includes('anak')) {
    return {
      agency: 'National Registration Department (JPN) & Immigration',
      content: `Here is the simple guide for **MyKad & Passport Services**:

### 1. Replace Damaged MyKad (IC Chip):
- **Fastest Option**: Walk into any **UTC (Urban Transformation Centre)** or JPN branch.
- **Fee**: **RM10** for damaged chip replacement.
- **Time**: Ready in **30 to 45 minutes** at major UTCs.
- **What to bring**: Just bring your current MyKad.

### 2. Renew Malaysian Passport:
- Passport renewals must be done **online** via the Immigration portal (**imigresen-online.imi.gov.my**).
- **Standard Fee**: **RM200** (5 years validity for ages 13–59).
- **Senior Citizens (60+) & Children (<12)**: **RM100**.
- Upload your photo, pay online, and collect at your chosen Immigration office.`,
      actionCards: [
        {
          id: 'act-jpn-utc',
          title: 'Book JPN Appointment',
          subtitle: 'Check UTC opening hours and book a slot',
          type: 'link',
          url: 'https://mytemujanji.jpn.gov.my',
          btnText: 'Book Slot',
          icon: 'external',
        },
      ],
      suggestions: [
        'What are UTC opening hours on weekends?',
        'What are the photo rules for passport renewal?',
        'How do I register a newborn baby (MyKid)?',
      ],
    };
  }

  // 5. Tax / LHDN / e-Filing
  if (query.includes('tax') || query.includes('cukai') || query.includes('lhdn') || query.includes('e-filing') || query.includes('hasil') || query.includes('relief') || query.includes('borang')) {
    return {
      agency: 'Lembaga Hasil Dalam Negeri (LHDN)',
      content: `Here is a summary of the most popular **Personal Tax Reliefs** you can claim on your e-Filing:

### Main Tax Reliefs:
- **Individual & Dependents**: **RM9,000** (automatic)
- **Medical Expenses (Self/Family)**: Up to **RM10,000** (includes dental and medical checkups)
- **Lifestyle (Phone/Laptop/Internet/Books)**: Up to **RM2,500**
- **Sports Equipment & Gym**: Up to **RM1,000**
- **EPF Contribution**: Up to **RM4,000**
- **Life Insurance**: Up to **RM3,000**
- **SSPN Education Savings for Kids**: Up to **RM8,000** net savings

### How to Submit:
Log in to **MyTax (mytax.hasil.gov.my)** using your IC number. If your PCB deductions were higher than your final tax, your refund will be deposited into your bank account within a few weeks.`,
      actionCards: [
        {
          id: 'act-mytax',
          title: 'Open LHDN MyTax',
          subtitle: 'Log in to submit your e-Filing',
          type: 'link',
          url: 'https://mytax.hasil.gov.my',
          btnText: 'Open MyTax',
          icon: 'external',
        },
      ],
      suggestions: [
        'What is the deadline for e-Filing Form BE?',
        'How do I get my tax refund if I overpaid?',
        'How to register a new tax file for first-time workers?',
      ],
    };
  }

  // 6. PTPTN Higher Education Loan & Application
  if (query.includes('ptptn') || query.includes('student loan') || query.includes('pinjaman pelajaran') || query.includes('sspn') || query.includes('study loan')) {
    return {
      agency: 'Perbadanan Tabung Pendidikan Tinggi Nasional (PTPTN)',
      content: `Here is the comprehensive guide to apply for a **PTPTN Higher Education Loan**:

## Key Requirements & Application Steps:
1. **Open Simpan SSPN Account**: You must have an active SSPN-i (SSPN Prime / Plus) account with a minimum deposit of RM20.
2. **Bank Account**: Open a savings account with PTPTN's designated panel bank (e.g. Bank Islam, Maybank).
3. **Application Window**: Submit your application online via the **[MyPTPTN Portal](https://myp.ptptn.gov.my)** during your institution's approved application intake period.
4. **Loan Repayment Exemption**: First-class degree honours graduates can apply for a **100% full loan waiver** (converting loan to full scholarship).`,
      eligibility: {
        title: 'PTPTN Loan Eligibility Check',
        summary: 'Review the qualification requirements before submitting your online application:',
        criteria: [
          { id: 'c1', label: 'Citizenship', requirement: 'Malaysian Citizen with valid MyKad', isMandatory: true },
          { id: 'c2', label: 'Age Limit', requirement: 'Aged 45 years or below on application date', isMandatory: true },
          { id: 'c3', label: 'Admission Offer', requirement: 'Valid offer letter for Diploma / Degree from accredited IPTA/IPTS/Politeknik', isMandatory: true },
          { id: 'c4', label: 'Course Accreditation', requirement: 'Approved by KPT and accredited by MQA (Malaysian Qualifications Agency)', isMandatory: true },
          { id: 'c5', label: 'Simpan SSPN Account', requirement: 'Active Simpan SSPN account registered under applicant MyKad', isMandatory: true },
          { id: 'c6', label: 'Remaining Duration', requirement: 'Course remaining duration of at least 1 year', isMandatory: true },
          { id: 'c7', label: 'No Sponsorship Overlap', requirement: 'No other concurrent educational loans or scholarships for the same course', isMandatory: true },
        ],
      },
      actionCards: [
        {
          id: 'act-myptptn',
          title: 'MyPTPTN Portal',
          subtitle: 'Apply for study loan & check intake dates',
          type: 'link',
          url: 'https://myp.ptptn.gov.my',
          btnText: 'Open MyPTPTN',
          icon: 'external',
        },
        {
          id: 'act-sspn',
          title: 'Simpan SSPN Online',
          subtitle: 'Open or top-up your SSPN savings account',
          type: 'link',
          url: 'https://www.ptptn.gov.my',
          btnText: 'Open SSPN',
          icon: 'external',
        },
      ],
      suggestions: [
        'How to get 100% PTPTN loan exemption for first class degree?',
        'What is the difference between Maximum, Medium, and Minimum loan tiers?',
        'Which panel banks are supported by PTPTN?',
      ],
    };
  }

  // 7. Housing / PR1MA / PPR / Property
  if (query.includes('house') || query.includes('rumah') || query.includes('pr1ma') || query.includes('ppr') || query.includes('property') || query.includes('selangorku')) {
    return {
      agency: 'Ministry of Housing (KPKT) / PR1MA',
      content: `Here are the basic eligibility requirements for **PR1MA Affordable Housing**:

### Eligibility:
- Malaysian citizen, aged **21 and above**.
- Single or combined monthly household income between **RM2,500 and RM15,000**.
- You can apply as a 1st or 2nd home buyer.

### What Documents You Need:
1. Copy of MyKad (Applicant & Spouse).
2. Latest 3 months payslips & EPF statement.
3. Employment confirmation letter.

### How to Apply:
Register for free on the official PR1MA portal at **[www.pr1ma.my](https://www.pr1ma.my)** and browse available homes in your desired location.`,
      eligibility: {
        title: 'PR1MA Housing Eligibility Check',
        summary: 'Check if you qualify to purchase a PR1MA residential property:',
        criteria: [
          { id: 'c1', label: 'Citizenship', requirement: 'Malaysian Citizen (Individual or Joint Applicant)', isMandatory: true },
          { id: 'c2', label: 'Age Limit', requirement: 'Aged 21 years and above', isMandatory: true },
          { id: 'c3', label: 'Income Bracket', requirement: 'Household income between RM2,500 and RM15,000/month', isMandatory: true },
          { id: 'c4', label: 'Home Ownership', requirement: 'First or second home buyer only', isMandatory: true },
        ],
      },
      actionCards: [
        {
          id: 'act-pr1ma',
          title: 'Browse PR1MA Homes',
          subtitle: 'View available residential developments',
          type: 'link',
          url: 'https://www.pr1ma.my',
          btnText: 'Visit PR1MA',
          icon: 'external',
        },
      ],
      suggestions: [
        'What is the difference between PR1MA and PPR?',
        'How can gig workers get a housing loan without salary slips?',
      ],
    };
  }

  // 7. General Fallback
  return {
    agency: 'MyGateway Public Service AI',
    content: `Here is the guidance for **"${userQuery}"**:

MyGateway AI helps citizens easily access information across all Malaysian government services.

### General Tips:
1. **Official Portals**: Most services can now be done online using your MyKad number.
2. **One-Stop Counters (UTC)**: For services requiring physical biometric verification or instant card collection, you can visit any nearby UTC branch.
3. **Assistance Hotline**: For direct public service phone support, you can call the government call centre at **03-8000 8000** (1-MOCC).

Please feel free to ask a more specific question or select from the common topics below!`,
    actionCards: [
      {
        id: 'act-malaysia-gov',
        title: 'Malaysia.gov.my Portal',
        subtitle: 'Official government public services directory',
        type: 'link',
        url: 'https://www.malaysia.gov.my',
        btnText: 'Open Portal',
        icon: 'external',
      },
    ],
    suggestions: [
      'How do I renew my driving licence online?',
      'How to check my STR cash aid status?',
      'Where is the nearest UTC branch?',
    ],
  };
}
