CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Procedura: usuwa przeterminowane bany (banned_until < CURRENT_TIMESTAMP)
DROP PROCEDURE IF EXISTS cleanup_expired_bans CASCADE;
CREATE OR REPLACE PROCEDURE cleanup_expired_bans()
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM banned_users_per_streamer
  WHERE banned_until IS NOT NULL AND banned_until < CURRENT_TIMESTAMP;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % expired bans', deleted_count;
END;
$$;

-- Funkcja trigger: wywołuje procedurę czyszczenia przed każdym nowym banem
DROP FUNCTION IF EXISTS remove_expired_bans_before_insert CASCADE;
CREATE OR REPLACE FUNCTION remove_expired_bans_before_insert() RETURNS TRIGGER AS $$
BEGIN
  CALL cleanup_expired_bans();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: automatycznie wywołuje powyższą funkcję przed każdym INSERT do banned_users_per_streamer
DROP TRIGGER IF EXISTS trg_remove_expired_bans_before_insert ON banned_users_per_streamer;
CREATE TRIGGER trg_remove_expired_bans_before_insert
BEFORE INSERT ON banned_users_per_streamer
FOR EACH ROW
EXECUTE FUNCTION remove_expired_bans_before_insert();

-- Procedura: waliduje czy banned_until nie jest w przeszłości
DROP PROCEDURE IF EXISTS validate_ban_date_procedure CASCADE;
CREATE OR REPLACE PROCEDURE validate_ban_date_procedure(p_banned_until TIMESTAMP)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Sprawdź czy banned_until jest ustawione i czy nie jest w przeszłości
  IF p_banned_until IS NOT NULL AND p_banned_until < CURRENT_TIMESTAMP THEN
    RAISE EXCEPTION 'Nie można ustawić daty zakończenia bana w przeszłości. Data: %, Obecny czas: %', 
      p_banned_until, CURRENT_TIMESTAMP
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

-- Funkcja trigger: wywołuje procedurę walidacji daty bana
DROP FUNCTION IF EXISTS validate_ban_date CASCADE;
CREATE OR REPLACE FUNCTION validate_ban_date() RETURNS TRIGGER AS $$
BEGIN
  CALL validate_ban_date_procedure(NEW.banned_until);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: waliduje datę bana przed INSERT i UPDATE
DROP TRIGGER IF EXISTS trg_validate_ban_date ON banned_users_per_streamer;
CREATE TRIGGER trg_validate_ban_date
  BEFORE INSERT OR UPDATE ON banned_users_per_streamer
  FOR EACH ROW
  EXECUTE FUNCTION validate_ban_date();

-- 1. Trigger walidujący datę - nie pozwala na wstawienie tokenu z expires_at w przeszłości
DROP FUNCTION IF EXISTS validate_token_date CASCADE;
CREATE OR REPLACE FUNCTION validate_token_date() RETURNS TRIGGER AS $$
BEGIN
  -- Sprawdź czy nowy token nie ma daty w przeszłości (z małym marginesem na opóźnienia)
  IF NEW.expires_at < (CURRENT_TIMESTAMP - INTERVAL '5 seconds') THEN
    RAISE EXCEPTION 'Token nie może mieć daty wygaśnięcia w przeszłości. Podana data: %, Obecny czas: %', 
      NEW.expires_at, CURRENT_TIMESTAMP
      USING ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla walidacji daty
DROP TRIGGER IF EXISTS trg_validate_token_date ON refresh_tokens;
CREATE TRIGGER trg_validate_token_date
  BEFORE INSERT OR UPDATE ON refresh_tokens
  FOR EACH ROW
  EXECUTE FUNCTION validate_token_date();

-- 2. Trigger przenoszący wygasłe tokeny do invalidated_refresh_tokens
DROP FUNCTION IF EXISTS cleanup_expired_tokens CASCADE;
CREATE OR REPLACE FUNCTION cleanup_expired_tokens() RETURNS TRIGGER AS $$
DECLARE
  moved_count INTEGER;
BEGIN
  -- Przenieś wygasłe tokeny do tabeli invalidated_refresh_tokens
  WITH expired_tokens AS (
    DELETE FROM refresh_tokens
    WHERE expires_at < CURRENT_TIMESTAMP
    RETURNING id, token, user_id
  )
  INSERT INTO invalidated_refresh_tokens (id, token, user_id, invalidated_at)
  SELECT id, token, user_id, CURRENT_TIMESTAMP
  FROM expired_tokens;
  
  GET DIAGNOSTICS moved_count = ROW_COUNT;
  
  IF moved_count > 0 THEN
    RAISE NOTICE 'Przeniesiono % wygasłych tokenów do invalidated_refresh_tokens', moved_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla czyszczenia wygasłych tokenów (uruchamia się PRZED walidacją)
DROP TRIGGER IF EXISTS trg_cleanup_expired_tokens ON refresh_tokens;
CREATE TRIGGER trg_cleanup_expired_tokens
  BEFORE INSERT ON refresh_tokens
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_expired_tokens();

-- Funkcja: zwraca x najbardziej aktywnych użytkowników czatu danego streama (tylko zakończone transmisje)
DROP FUNCTION IF EXISTS get_top_chat_users_for_stream_id(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_top_chat_users_for_stream_id(p_stream_id INTEGER, p_limit INTEGER)
RETURNS TABLE(user_id INTEGER, username TEXT, message_count INTEGER) AS $$
BEGIN
  RETURN QUERY
    SELECT cm.user_id, ui.username, COUNT(*)::INTEGER AS message_count
    FROM public.chat_messages cm
    JOIN public.users u ON u.id = cm.user_id
    JOIN public.users_info ui ON ui.id = u.user_info_id
    JOIN public.streams s ON s.id = cm.stream_id
    JOIN public.stream_options so ON so.id = s.options_id
    WHERE cm.stream_id = p_stream_id
      AND cm.is_deleted = FALSE
      AND so."isLive" = FALSE
    GROUP BY cm.user_id, ui.username
    ORDER BY message_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca x najbardziej aktywnych użytkowników czatu ze wszystkich zakończonych i publicznych streamów danego streamera
DROP FUNCTION IF EXISTS get_top_chat_users_for_streamer(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_top_chat_users_for_streamer(p_streamer_id INTEGER, p_limit INTEGER)
RETURNS TABLE(user_id INTEGER, username TEXT, message_count INTEGER) AS $$
BEGIN
  RETURN QUERY
    SELECT cm.user_id, ui.username, COUNT(*)::INTEGER AS message_count
    FROM public.chat_messages cm
    JOIN public.users u ON u.id = cm.user_id
    JOIN public.users_info ui ON ui.id = u.user_info_id
    JOIN public.streams s ON s.id = cm.stream_id
    JOIN public.stream_options so ON so.id = s.options_id
    WHERE s.streamer_id = p_streamer_id
      AND so."isLive" = FALSE
      AND so."isDeleted" = FALSE
      AND so."isPublic" = TRUE
      AND cm.is_deleted = FALSE
    GROUP BY cm.user_id, ui.username
    ORDER BY message_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- Funkcja: zwraca listę streamerów subskrybowanych przez użytkownika wraz z danymi streamera
DROP FUNCTION IF EXISTS get_streamers_subscribed_by_user CASCADE;
CREATE OR REPLACE FUNCTION get_streamers_subscribed_by_user(p_user_id INTEGER)
RETURNS TABLE(subscriber_id INTEGER, user_id INTEGER, streamer_id INTEGER, streamer_username TEXT, profile_picture TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT 
      s.id AS subscriber_id, 
      s.user_id AS user_id, 
      s.streamer_id AS streamer_id, 
      ui.username AS streamer_username, 
      ui.profile_picture AS profile_picture
    FROM subscribers s
    JOIN streamers str ON s.streamer_id = str.id
    JOIN users u ON str.user_id = u.id
    JOIN users_info ui ON u.user_info_id = ui.id
    WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- Funkcja: generuje raport jak często streamer streamuje (liczba streamów, daty startu i końca)
DROP FUNCTION IF EXISTS get_streaming_report_for_streamer CASCADE;
CREATE OR REPLACE FUNCTION get_streaming_report_for_streamer(p_streamer_id INTEGER)
RETURNS TABLE(stream_id INTEGER, started_at TIMESTAMP, ended_at TIMESTAMP) AS $$
BEGIN
  RETURN QUERY
    SELECT s.id AS stream_id, so.created_at AS started_at, so.updated_at AS ended_at
    FROM streams s
    JOIN stream_options so ON so.id = s.options_id
    WHERE s.streamer_id = p_streamer_id
    ORDER BY so.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca średnią długość streamów danego streamera
DROP FUNCTION IF EXISTS get_average_stream_duration_for_streamer(p_streamer_id INTEGER) CASCADE;

CREATE OR REPLACE FUNCTION get_average_stream_duration_for_streamer(p_streamer_id INTEGER)
RETURNS TABLE(average_duration TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT TO_CHAR(AVG(ended_at - started_at), 'HH24:MI:SS')
  FROM get_streaming_report_for_streamer(p_streamer_id)
  WHERE ended_at IS NOT NULL AND started_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca liczbę zbanowanych użytkowników danego streamera
DROP FUNCTION IF EXISTS get_banned_users_count_for_streamer CASCADE;
CREATE OR REPLACE FUNCTION get_banned_users_count_for_streamer(p_streamer_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM banned_users_per_streamer b
    JOIN streamers s ON s.id = b.streamer_id
    WHERE s.id = p_streamer_id
      AND b.banned_until IS NULL OR b.banned_until > CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca liczbę moderatorów danego streamera
DROP FUNCTION IF EXISTS get_moderators_count_for_streamer CASCADE;
CREATE OR REPLACE FUNCTION get_moderators_count_for_streamer(p_streamer_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM stream_moderators sm
    JOIN streamers s ON s.id = sm.streamer_id
    WHERE s.id = p_streamer_id
  );
END;
$$ LANGUAGE plpgsql;


-- Funkcja: zwraca najbardzej followanych streamerów
DROP FUNCTION IF EXISTS get_top_followed_streamers(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_top_followed_streamers(p_limit INTEGER)
RETURNS TABLE(streamer_id INTEGER, username TEXT, profile_picture TEXT, followers_count INTEGER) AS $$
BEGIN
  RETURN QUERY
    SELECT s.id AS streamer_id, ui.username, ui.profile_picture, get_followers_count_for_user(u.id) AS followers_count
    FROM streamers s
    JOIN users u ON u.id = s.user_id
    JOIN users_info ui ON ui.id = u.user_info_id
    ORDER BY followers_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca najbardzej subskrybowanych streamerów
DROP FUNCTION IF EXISTS get_top_subscribed_streamers(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_top_subscribed_streamers(p_limit INTEGER)
RETURNS TABLE(streamer_id INTEGER, username TEXT, profile_picture TEXT, subscribers_count INTEGER) AS $$
BEGIN
  RETURN QUERY
    SELECT s.id AS streamer_id, ui.username, ui.profile_picture, get_subscribers_count_for_streamer(s.id) AS subscribers_count
    FROM streamers s
    JOIN users u ON u.id = s.user_id
    JOIN users_info ui ON ui.id = u.user_info_id
    ORDER BY subscribers_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca liczbę obserwujących danego użytkownika
DROP FUNCTION IF EXISTS get_followers_count_for_user CASCADE;
CREATE OR REPLACE FUNCTION get_followers_count_for_user(p_user_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM followers f
    WHERE f.followed_user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca liczbę subskrybentów danego streamera
DROP FUNCTION IF EXISTS get_subscribers_count_for_streamer CASCADE;
CREATE OR REPLACE FUNCTION get_subscribers_count_for_streamer(p_streamer_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM subscribers s
    WHERE s.streamer_id = p_streamer_id
  );
END;
$$ LANGUAGE plpgsql;