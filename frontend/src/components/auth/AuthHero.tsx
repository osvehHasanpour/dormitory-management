import loginPicture from "@media/login_picture.jpg";

export function AuthHero() {
  return (
    <div className="flex w-full items-center justify-center bg-canvas px-3 py-4 sm:px-5 sm:py-5 md:px-8 md:py-6 lg:min-h-[min(460px,58vh)] lg:px-6 lg:py-6">
      <img
        src={loginPicture}
        alt="تصویر ساختمان خوابگاه"
        className="block h-auto w-full max-w-full object-contain object-center md:max-w-[min(100%,520px)] lg:max-w-full"
        decoding="async"
      />
    </div>
  );
}
