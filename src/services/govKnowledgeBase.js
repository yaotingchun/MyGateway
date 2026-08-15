/**
 * Malaysian Government Public Services Knowledge Base
 * Used for grounding and augmenting Google Gemini responses in MyGateway AI.
 */

export const MALAYSIAN_GOV_KNOWLEDGE_BASE = `
# MALAYSIAN GOVERNMENT PUBLIC SERVICES OFFICIAL KNOWLEDGE BASE

## 1. BUSINESS & COMMERCE (STARTING A BUSINESS / FOOD & BEVERAGE SETUP)

### A. General Business Registration (SSM)
- **Agency**: Suruhanjaya Syarikat Malaysia (Companies Commission of Malaysia - SSM)
- **Portal**: SSM EzBiz Online (https://ezbiz.ssm.com.my) / MyData SSM (https://www.mydata-ssm.com.my)
- **Business Entities**:
  1. **Sole Proprietorship (Milikan Tunggal)**: Owned by 1 Malaysian/PR citizen. Fee: RM30/year (Personal Name) or RM60/year (Trade Name).
  2. **Partnership (Perkongsian)**: 2 to 20 Malaysian/PR partners. Fee: RM60/year (Trade Name).
  3. **Private Limited Company (Sdn Bhd)**: Incorporated via MyCoID portal (https://mycoid2016.ssm.com.my). Requires minimum 1 director & shareholder, company secretary.
  4. **Branch Fee**: RM5 per branch per year.
- **Documents Required**: MyKad copy, proposed business name, business address.
- **Approval Time**: Usually within 24 hours via EzBiz.

### B. Food & Beverage (F&B) Business Setup Requirements (Crucial Step-by-Step Flow)
To start a food business in Malaysia (restaurant, cafe, food truck, catering, or home-based food), the following sequential applications and agencies are strictly required:

1. **Step 1: Business Registration with SSM**
   - **Agency**: Suruhanjaya Syarikat Malaysia (SSM)
   - **Portal**: https://ezbiz.ssm.com.my
   - **Purpose**: Legal entity registration to obtain Business Registration Certificate (Borang D / E) and SSM registration number.

2. **Step 2: Food Handler Training & Typhoid Inoculation**
   - **Agency**: Ministry of Health Malaysia (Kementerian Kesihatan Malaysia - KKM) / Food Safety and Quality Division (BKKM)
   - **Requirements**:
     a. **Food Handler Training (Kursus Latihan Pengendali Makanan - SLPM)**: Mandatory 3-hour certified course by KKM-accredited training institutions (Sekolah Latihan Pengendali Makanan). Certificate valid for life. Fee: ~RM50 per person.
     b. **Typhoid Vaccination (Suntikan Tifoid TY2)**: Mandatory for all food handlers and owners. Valid for 3 years. Available at private clinics (~RM60-RM100) or government health clinics (Klinik Kesihatan).
   - **Portal**: Food Safety Information System of Malaysia (FoSIM) (https://fosim.moh.gov.my)

3. **Step 3: Business Premise & Signboard License from Local Council (PBT)**
   - **Agency**: Respective Local Council / Pihak Berkuasa Tempatan (e.g. DBKL, MBPJ, MBSA, MBJB, MPKJ, MBPP, etc.)
   - **Applications**:
     a. **Lesen Premis Perniagaan (Business Premise License)**: Requires premise tenancy agreement, floor plan, Fire & Rescue Department (BOMBA) safety support letter, pest control contract, grease trap installation certificate.
     b. **Lesen Papan Iklan (Signboard License)**: Requires Dewan Bahasa dan Pustaka (DBP) Malay language visual verification (https://dbpsahbahasa.dbp.gov.my) before local council signboard approval.
   - **Portal**: BLESS (Business Licensing Electronic Support System) / OSC Online / Respective PBT Portal.

4. **Step 4: Halal Certification (JAKIM / JAIN) - Recommended / Required for Halal Market**
   - **Agency**: Department of Islamic Development Malaysia (JAKIM) or State Islamic Religious Departments (JAIN)
   - **Portal**: MYeHALAL System (https://myehalal.halal.gov.my)
   - **Requirements**: Must have SSM certificate, PBT premise license, minimum 2 Muslim staff for food preparation, certified Halal ingredients/suppliers, Halal Assurance Management System (HAS).
   - **Fees**: Micro industry ~RM100-RM200; Small industry ~RM400-RM800 + audit fees.

5. **Step 5: Food Safety Assurance Programme (MeSTI / GMP / HACCP)**
   - **Agency**: KKM (Food Safety and Quality Division - BKKM)
   - **Portal**: FoSIM MeSTI (https://fosim.moh.gov.my)
   - **Purpose**: Skim Pensijilan Makanan Selamat (MeSTI) is mandatory for food manufacturing facilities and home-based food suppliers looking to sell through supermarkets/convenience chains. Free auditing by KKM officers.

6. **Step 6: Tax Registration & e-Invoicing Compliance (LHDN)**
   - **Agency**: Lembaga Hasil Dalam Negeri (LHDN / Inland Revenue Board)
   - **Portal**: MyTax (https://mytax.hasil.gov.my) / e-Daftar (https://edaftar.hasil.gov.my)
   - **Purpose**: Register for Income Tax File (e.g., Form B for business income). Comply with National e-Invoicing (e-Invois) requirements via MyInvois Portal.

7. **Step 7: Employer Statutory Contributions (If hiring employees)**
   - **Agencies**:
     a. **Employees Provident Fund (KWSP / EPF)**: Mandatory retirement savings (12-13% employer, 11% employee). Portal: https://www.kwsp.gov.my (i-Akaun Majikan).
     b. **Social Security Organisation (PERKESO / SOCSO)**: Employment injury & invalidity scheme (1.75% employer, 0.5% employee). Portal: ASSIST Portal (https://assist.perkeso.gov.my).
     c. **Employment Insurance System (EIS / SIP)**: 0.2% employer, 0.2% employee via PERKESO.
     d. **Human Resources Development Corporation (HRD Corp)**: Training levy for employers with 10+ employees. Portal: https://hrdcorp.gov.my.

---

## 2. TRANSPORT & ROAD TRANSPORT DEPARTMENT (JPJ)

- **Agency**: Jabatan Pengangkutan Jalan (JPJ)
- **Portals**: MyJPJ Mobile App / MySikap Portal (https://public.jpj.gov.my)
- **Key Services**:
  1. **Competent Driving Licence (CDL) Renewal**:
     - Fee: RM30/year (Class D/DA cars), RM20/year (Class B2 motor).
     - 10-Year Discount: Renew for 10 years at RM270 (get 10% / 1 year free).
     - Digital license in MyJPJ app is fully valid and legally accepted nationwide.
  2. **Motor Vehicle Licence (Road Tax / LKM)**:
     - Digital road tax available in MyJPJ app without requiring physical windscreen sticker.
     - Renewal requires valid motor insurance (e-Cover note).
  3. **Vehicle Ownership Transfer (Tukar Hak Milik)**:
     - Online biometric thumbprint verification via MyJPJ / MySikap or walk-in after Puspakom B5 inspection.
  4. **Expired Licence > 3 Years**:
     - Requires rayuan lesen memandu tamat tempoh via JPJ counter or e-Aduan before re-examination.

---

## 3. SOCIAL WELFARE, CASH AID & SUBSIDIES

### A. Sumbangan Tunai Rahmah (STR) & SARA
- **Agency**: Ministry of Finance (MOF) & LHDN
- **Portal**: https://bantuantunai.hasil.gov.my
- **Eligibility & Aid**:
  - Households Income < RM2,500/month: Up to RM2,500/year (scaled by number of children).
  - Households Income RM2,501 - RM5,000/month: Up to RM1,250/year.
  - Senior Citizens (60+ without spouse): RM600/year.
  - Single Adults (21-59, income < RM2,500): RM350/year.
  - **Sumbangan Asas Rahmah (SARA)**: Additional cashless grocery aid credited monthly to MyKad for hardcore poor (e-Kasih registered).

### B. Targeted Subsidies (BUDI MADANI)
- **Agency**: Ministry of Finance (MOF)
- **Portal**: https://budimadani.gov.my
- **Categories**: BUDI Individu (RM200/month diesel cash assistance for private diesel vehicle owners), BUDI Agri-Komoditi (RM200/month for smallholders).

### C. Welfare Aid (JKM)
- **Agency**: Jabatan Kebajikan Masyarakat (JKM)
- **Portal**: eBantuan JKM (https://ebantuanjkm.jkm.gov.my)
- **Schemes**: Bantuan Kanak-Kanak (BKK), Bantuan Warga Emas (BWE - RM500/month), Elaun Pekerja Cacat (EPC - RM450/month), Bantuan Penjagaan OKU terlantar.

---

## 4. IDENTITY, CITIZENSHIP & IMMIGRATION

### A. National Registration Department (JPN)
- **Agency**: Jabatan Pendaftaran Negara (JPN)
- **Portal**: https://www.jpn.gov.my / MyTemujanji (https://mytemujanji.jpn.gov.my)
- **Services**:
  1. **MyKad Replacement (Damaged Chip / Lost IC)**:
     - Damaged chip fee: RM10. Ready in 30-45 minutes at any Urban Transformation Centre (UTC).
     - Lost IC penalty: 1st time RM100, 2nd time RM300, 3rd time RM1,000 + police report.
  2. **Birth Registration (Daftar Kelahiran / MyKid)**:
     - Within 60 days of birth. Online pre-registration via JPN portal, then collection at UTC/JPN.
  3. **Marriage Registration (Daftar Perkahwinan Sivil)**: Form JPN.KC02.

### B. Immigration Department (Jabatan Imigresen Malaysia - JIM)
- **Agency**: Jabatan Imigresen Malaysia (JIM)
- **Portal**: MyOnline Passport (https://imigresen-online.imi.gov.my)
- **Services**:
  1. **Malaysian International Passport Renewal**:
     - Mandatory online application for adults (13-59 years).
     - Standard fee: RM200 (5 years validity).
     - Special fee: RM100 (Senior citizens 60+, children <12). OKU: Free.
     - Collection at selected Immigration office or UTC with original IC and old passport.

---

## 5. HOUSING & PROPERTY (AFFORDABLE HOUSING)

### A. PR1MA Housing
- **Agency**: Perbadanan PR1MA Malaysia
- **Portal**: https://www.pr1ma.my
- **Eligibility**: Malaysian citizen, aged 21+, individual/combined household income RM2,500 - RM15,000/month, 1st or 2nd home.

### B. Program Perumahan Rakyat (PPR) & Rumah Mesra Rakyat (SPNB)
- **Agencies**: Kementerian Perumahan dan Kerajaan Tempatan (KPKT) / Syarikat Perumahan Negara Berhad (SPNB)
- **Portals**: Sistem TEDUH (https://teduh.kpkt.gov.my) / SPNB (https://spnb.com.my)
- **Eligibility**: B40 households with income below RM3,000/month, non-homeowners or owning dilapidated houses on own land.

### C. Government Housing Loan (LPPSA)
- **Agency**: Lembaga Pembiayaan Perumahan Sektor Awam (LPPSA)
- **Portal**: https://www.lppsa.gov.my
- **Eligibility**: Permanent public sector civil servants in Malaysia.

---

## 6. TAXATION & REVENUE (LHDN)

- **Agency**: Lembaga Hasil Dalam Negeri (LHDN / Inland Revenue Board)
- **Portals**: MyTax (https://mytax.hasil.gov.my) / e-Filing (https://ez.hasil.gov.my)
- **Key Forms**:
  - **Form BE**: Resident individuals without business income (employment salary). Due 30 April (online extension to 15 May).
  - **Form B**: Resident individuals with business income (sole proprietorship/partnership). Due 30 June (online extension to 15 July).
- **Popular Personal Tax Reliefs**:
  - Individual & Dependent Relatives: RM9,000
  - Medical Treatment (Serious illness, dental, full check-up): Up to RM10,000
  - Lifestyle (Books, PC, Smartphone, Internet, Sports): Up to RM2,500
  - Additional Sports Equipment & Gym: Up to RM1,000
  - EPF / Approved Pension Scheme: Up to RM4,000
  - Life Insurance / Takaful: Up to RM3,000
  - SSPN Net Savings for Children: Up to RM8,000
  - SOCSO / EIS Contribution: Up to RM350
  - Electric Vehicle (EV) Charging Facilities: Up to RM2,500
  - Child Care Centre Fees (Tadika / Taska): Up to RM3,000

---

## 7. HEALTHCARE & HIGHER EDUCATION (PTPTN)

### A. Higher Education Loan (PTPTN) & Savings
- **Agency**: Perbadanan Tabung Pendidikan Tinggi Nasional (PTPTN)
- **Portal**: MyPTPTN Portal (https://myp.ptptn.gov.my)
- **Key Eligibility Requirements**:
  1. **Citizenship**: Malaysian citizen with valid MyKad.
  2. **Age Limit**: Aged 45 years and below on the date of application.
  3. **Admission Offer**: Received official offer letter for full-time/part-time Diploma, Degree, Master, or PhD from an accredited IPTA, IPTS, or Politeknik.
  4. **Accreditation**: Course must be registered and approved by the Ministry of Higher Education (KPT) and accredited by MQA (Malaysian Qualifications Agency).
  5. **Remaining Duration**: Remaining course duration at the time of application must not be less than 1 year.
  6. **Active SSPN Account**: Must have an active Simpan SSPN (SSPN Prime / SSPN Plus) account registered under applicant's MyKad (minimum deposit RM20).
  7. **No Overlapping Sponsorship**: Must not receive any other financial sponsorships, scholarships, or loans for the same course.
  8. **Panel Bank Account**: Must have a valid individual savings account with designated panel banks (e.g. Bank Islam, Maybank, CIMB, Bank Rakyat, RHB).
- **Loan Amounts**:
  - Maximum Tier: For students or parents listed as STR / e-Kasih cash aid recipients (100% maximum loan).
  - Medium Tier: For households in M40 income bracket (75% loan).
  - Minimum Tier: For households in T20 income bracket (50% loan).
- **Loan Exemption**: First-class degree graduates (Ijazah Sarjana Muda Kelas Pertama) from accredited IPTs can apply for 100% PTPTN loan repayment exemption (convert loan to scholarship).

### B. Healthcare & Subsidized Schemes (KKM)
- **Agency**: Kementerian Kesihatan Malaysia (KKM)
- **Portal**: MySejahtera App / PeKa B40 (https://pekab40.com.my)
- **PeKa B40 Eligibility**:
  - Malaysian citizen, aged 40 and above.
  - Recipient of Sumbangan Tunai Rahmah (STR) and their registered spouse.
  - Automatically qualified without registration; walk in with MyKad to participating private or government PeKa B40 clinics.
- **Skim Perubatan MADANI Eligibility**:
  - Active recipients of Sumbangan Tunai Rahmah (STR) in household / senior / single categories.
  - Free outpatient treatment at registered panel GP clinics.
`;
