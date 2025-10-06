import React, { useEffect, useState } from "react";
import api from "../api/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import PublicMemberCard from "./PublicMemberCard";
import "swiper/css";
import "swiper/css/autoplay";

const EnabledMembersCarousel = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/members", {
          // ✅ เอาเฉพาะ enabled
          params: {
            enabled: true,
            limit: 200,
            orderBy: "pin", // เรียงตาม rank (เรามีบน backend แล้ว)
            order: "asc",
          },
        });
        setMembers(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load enabled members:", err);
      }
    };
    load();
  }, []);

  if (!members.length) return null;

  return (
    <div className="relative py-10 ">
      {/* <h2 className="text-center text-2xl font-bold text-slate-800 mb-6">
        🎖 Our Featured Members
      </h2> */}

      {/* ทำให้ขอบซ้าย-ขวา fade แบบสวย ๆ (optional) */}
      <style>{`
        .carousel-fade-mask {
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
                  mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        }
      `}</style>

      <div className="carousel-fade-mask">
        <Swiper
          modules={[Autoplay]}
          slidesPerView="auto"
          spaceBetween={24}
          grabCursor
          autoplay={{ delay: 0, disableOnInteraction: false }}
          speed={5000} // ปรับความเร็วเลื่อน
          loop
          className="!overflow-hidden px-6"
        >
          {members.map((m) => (
            <SwiperSlide
              key={m._id}
              // ให้กว้างพอดีกับการ์ด PublicMemberCard (รูป h-72 + padding) ดูบาลานซ์
              style={{ width: "280px", display: "flex" }}
            >
              {/* ลิงก์ไปหน้า detail เช่นเดิม */}
              <Link to={`/member/${m._id}`} className="w-full">
                {/* ใช้การ์ดเดิมตรง ๆ เพื่อคงสไตล์ 100% */}
                <PublicMemberCard member={m} />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default EnabledMembersCarousel;
