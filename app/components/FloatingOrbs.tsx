"use client";

export default function FloatingOrbs() {
  const orbs = [
    { size: 200, top: "5%", left: "-5%", color: "#C4A88A", delay: "0s", duration: "8s" },
    { size: 150, top: "60%", left: "85%", color: "#8B7355", delay: "2s", duration: "10s" },
    { size: 120, top: "30%", left: "75%", color: "#3D352D", delay: "4s", duration: "12s" },
  ];

  return (
    <>
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="fixed rounded-full pointer-events-none -z-10"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle at 30% 30%, ${orb.color}, transparent 70%)`,
            animation: `float ${orb.duration} ease-in-out ${orb.delay} infinite`,
          }}
        />
      ))}
    </>
  );
}
