import loginPicture from "@media/login_picture.jpg";

export function AuthHero() {
  return (
    <div className="w-full overflow-hidden">
      <img
        src={loginPicture}
        alt="تصویر ساختمان خوابگاه"
        className="block h-auto w-full object-cover"
      />
    </div>
  );
}
