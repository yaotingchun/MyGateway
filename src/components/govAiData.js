// Simplified Government AI Assistant Data & Response Generator

export const STARTER_PROMPTS = [
  {
    id: 'p1',
    title: 'Renew Driving Licence & Road Tax',
    description: 'Check renewal fees, 10-year discount, and instant MyJPJ digital licence steps.',
    category: 'Transport & JPJ',
    icon: 'car',
    sampleQuery: 'How can I renew my Malaysian driving licence online?',
  },
  {
    id: 'p2',
    title: 'STR Cash Assistance & Payment Status',
    description: 'Check payment dates, household eligibility tiers, and how to receive aid.',
    category: 'Welfare & Aid',
    icon: 'wallet',
    sampleQuery: 'How do I check my STR cash assistance payment status?',
  },
  {
    id: 'p3',
    title: 'Register a New Business (SSM)',
    description: 'Simple steps to register a sole proprietorship or enterprise online.',
    category: 'Business & SSM',
    icon: 'briefcase',
    sampleQuery: 'What are the steps to register a new business with SSM EzBiz?',
  },
  {
    id: 'p4',
    title: 'MyKad Replacement & Walk-in',
    description: 'Fix unreadable IC chip at UTC within 45 minutes and fee details.',
    category: 'Identity (JPN)',
    icon: 'badge-check',
    sampleQuery: 'My MyKad chip is broken. Where can I get a replacement and what is the fee?',
  },
  {
    id: 'p5',
    title: 'Personal Tax Reliefs & e-Filing',
    description: 'Simple list of tax deductions for medical, lifestyle, EPF, and family.',
    category: 'Taxation (LHDN)',
    icon: 'file-text',
    sampleQuery: 'What tax reliefs can I claim for this year in e-Filing?',
  },
  {
    id: 'p6',
    title: 'Apply for Affordable Housing',
    description: 'Eligibility criteria and simple document checklist for PR1MA and PPR.',
    category: 'Housing (PR1MA)',
    icon: 'home',
    sampleQuery: 'How do I apply for PR1MA affordable housing scheme?',
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

  // 3. SSM / Business / Company / License
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

  // 6. Housing / PR1MA / PPR / Property
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
