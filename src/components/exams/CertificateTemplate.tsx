import React from 'react';
import { Award, ShieldCheck, Calendar, BookOpen, Star, Crown } from 'lucide-react';

interface Certificate {
    id: string;
    student_id: string;
    title: string;
    certificate_type: string;
    issue_date: string;
    verification_code: string;
    metadata: Record<string, unknown>;
}


export const CertificateTemplate = ({ certificate }: { certificate: Certificate }) => {
    const { metadata } = certificate;
    const issueDate = new Date(certificate.issue_date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="relative w-full aspect-[1.414/1] bg-white text-slate-900 overflow-hidden select-none print:m-0 print:shadow-none shadow-2xl">
            {/* Border Decorations */}
            <div className="absolute inset-0 border-[24px] border-slate-100" />
            <div className="absolute inset-4 border-[2px] border-slate-200" />
            <div className="absolute inset-6 border-[1px] border-slate-300" />

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-32 h-32 border-l-8 border-t-8 border-primary/20" />
            <div className="absolute top-0 right-0 w-32 h-32 border-r-8 border-t-8 border-primary/20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-l-8 border-b-8 border-primary/20" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r-8 border-b-8 border-primary/20" />

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[length:20px_20px]" />


            {/* Main Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-20 text-center">

                {/* Header */}
                <div className="mb-8 space-y-2">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                            <Award className="relative h-20 w-20 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-serif font-black tracking-widest uppercase text-slate-800">
                        Certificate of Achievement
                    </h1>
                    <div className="h-1 w-48 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
                </div>

                {/* Body */}
                <div className="space-y-6 max-w-2xl">
                    <p className="text-xl font-medium text-slate-500 italic">This is to certify that</p>

                    <h2 className="text-5xl font-serif font-black text-primary px-8 py-2 border-b-2 border-slate-100 min-w-[400px]">
                        {String(metadata?.student_name ?? 'Valued Student')}
                    </h2>

                    <p className="text-xl text-slate-600 leading-relaxed px-12">
                        has successfully fulfilled all the requirements for the examination in
                        <br />
                        <span className="text-2xl font-black text-slate-800 mt-2 block">
                            {String(metadata?.surah_name ?? certificate.title)}
                        </span>
                    </p>

                    <div className="flex items-center justify-center gap-12 mt-8">
                        <div className="text-center">
                            <p className="text-3xl font-black text-slate-800">{String(metadata?.score ?? 0)}%</p>
                            <p className="text-[10px] uppercase tracking-tighter font-bold text-slate-400">Total Score</p>
                        </div>
                        <div className="h-12 w-[1px] bg-slate-200" />
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-800">PASSED</p>
                            <p className="text-[10px] uppercase tracking-tighter font-bold text-slate-400">Status</p>
                        </div>
                    </div>
                </div>

                {/* Footer / Signatures */}
                <div className="mt-auto w-full flex justify-between items-end px-12">
                    <div className="text-left space-y-2">
                        <div className="h-[1px] w-48 bg-slate-300" />
                        <p className="text-sm font-bold text-slate-800">Academic Dean</p>
                        <p className="text-[10px] text-slate-400 font-medium">Vision 2026: AI Academy</p>
                    </div>

                    <div className="relative flex flex-col items-center">
                        <div className="absolute -top-12 opacity-10">
                            <ShieldCheck className="h-24 w-24 fill-primary" />
                        </div>
                        <div className="mb-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {/* Small QR Placeholder style */}
                            <div className="grid grid-cols-4 gap-1 w-12 h-12">
                                {[...Array(16)].map((_, i) => (
                                    <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-slate-800' : 'bg-slate-200'}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            VERIFY: {certificate.verification_code}
                        </p>
                    </div>

                    <div className="text-right space-y-2">
                        <p className="text-sm font-bold text-slate-800">{issueDate}</p>
                        <div className="h-[1px] w-48 bg-slate-300 ml-auto" />
                        <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Date of Issuance</p>
                    </div>
                </div>
            </div>

            {/* Final aesthetic touch: Holographic-like seal */}
            <div className="absolute top-10 right-10 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-amber-200 to-yellow-600 w-24 h-24 shadow-inner">
                <div className="absolute inset-1 rounded-full border-2 border-white/50 border-dashed animate-spin-slow" />
                <Crown className="h-10 w-10 text-amber-900 opacity-60" />
            </div>
        </div>
    );
};
