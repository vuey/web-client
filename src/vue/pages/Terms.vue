<template>
  <div class="terms">
    <button
      class="terms__link"
      @click="$router.go(-1)"
    >
      {{ 'terms-page.go-back-btn' | globalize }}
    </button>
    <h2 class="terms__title">
      {{ 'terms-page.title' | globalize }}
    </h2>
    <div class="terms__content">
      <vue-markdown
        class="terms__markdown"
        :source="'terms-page.terms' | globalize"
        :html="true"
      />
    </div>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'

export default {
  name: 'terms',
  components: {
    VueMarkdown,
  },
}
</script>

<style lang="scss">
@import "~@scss/variables";
@import "~@scss/mixins";

.terms {
  padding: 3.3rem 19.5rem;

  @include respond-to($x-medium) {
    padding: 3.3rem 10rem;
  }

  @include respond-to($medium) {
    padding: 3.3rem 8rem;
  }

  @include respond-to($tablet) {
    padding: 3.3rem 2rem;
  }
}

.terms__link {
  @include button();
  padding: 0;
  font-weight: normal;
  font-size: 1.3rem;
}

.terms__title {
  font-size: 4rem;
  font-weight: normal;
  color: $col-terms-title;
}

.terms__content {
  margin-top: 3.5rem;
  border-radius: .2rem;
  background-color: $col-terms-block-bg;
  padding: 3.2rem 2.5rem;

  @include box-shadow();
}

.terms__markdown {
  h3 {
    font-size: 2rem;
    font-weight: bold;
    color: $col-terms-header;
  }

  ul {
    margin-top: 1.6rem;
    margin-bottom: 4rem;

    li {
      display: flex;
      align-items: center;
      color: $col-terms-header;
      padding: .6rem 0;
      text-decoration: none;
      width: fit-content;

      &::before {
        content: "\2022";
        color: $col-terms-list-item;
        font-size: .8rem;
        margin: -.25rem .9rem 0 .4rem;
      }

      a:visited {
        color: $col-primary;
      }
    }
  }

  p {
    padding-bottom: 1.4rem;
    font-size: 1.4rem;
    color: $col-terms-text;
  }

  h4 {
    margin-top: 2.6rem;
    font-size: 1.4rem;
    padding-top: 0;
    padding-bottom: .3rem;
    opacity: 1;
    font-weight: bold;
    color: $col-terms-header;
  }

  a {
    color: $col-terms-link;
  }
}
</style>
