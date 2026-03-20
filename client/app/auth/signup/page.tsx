"use client";

import HeungkukLogo from "@/components/ui/HeungkukLogo";
import { signup } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      await signup({ userId, password, username });
      alert("회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.");
      router.push("/auth/login");
    } catch {
      setError("이미 사용 중인 아이디이거나 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <HeungkukLogo size={48} />
          <p className={styles.logoTitle}>흥국생명 연수원</p>
          <p className={styles.logoSub}>계정 등록</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>아이디</label>
            <input
              className={styles.input}
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>이름</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>비밀번호 확인</label>
            <input
              className={styles.input}
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "처리 중..." : "계정 등록"}
          </button>
        </form>

        <p className={styles.loginLink}>
          이미 계정이 있으신가요?{" "}
          <a href="/auth/login" className={styles.link}>
            로그인
          </a>
        </p>
      </div>
    </div>
  );
}
